<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Services\RentBillService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\UtilityService;
use App\Models\UtilityBill;
use App\Http\Resources\PaymentResource;

class LandlordPaymentController extends Controller
{
    protected RentBillService $rentBillService;
    protected UtilityService $utilityService;

    public function __construct(RentBillService $rentBillService, UtilityService $utilityService)
    {
        $this->rentBillService = $rentBillService;
        $this->utilityService = $utilityService;
    }

    /**
     * Display a listing of payments for the landlord.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        
        // Base query for filtering payments belonging to landlord's properties
        $baseQuery = Payment::whereHas('tenant.tenancies.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        });

        // Get paginated payments with eager loading
        $payments = (clone $baseQuery)
            ->with(['tenant', 'tenancy.unit.property', 'rentBill'])
            ->orderBy('paid_at', 'desc')
            ->paginate(15);

        // Calculate stats using cloned base queries
        $thisMonth = now()->startOfMonth();
        $stats = [
            'total_payments' => (clone $baseQuery)->count(),
            'total_amount' => (clone $baseQuery)->sum('amount'),
            'this_month_amount' => (clone $baseQuery)->where('paid_at', '>=', $thisMonth)->sum('amount'),
        ];

        return Inertia::render('landlord/payments/index', [
            'payments' => PaymentResource::collection($payments),
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search'),
            ],
        ]);
    }

    /**
     * Store a new payment record for a tenant.
     *
     * @param Request $request
     * @param Tenant $tenant
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request, Tenant $tenant)
    {
        $landlord = $request->user();
        
        // Authorization: ensure tenant belongs to landlord's property
        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to add payments for this tenant.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type' => ['required', Rule::in(['rent', 'utility'])],
            'payment_method' => 'required|string|max:255',
            'status' => ['required', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'required|date',
            'rent_bill_id' => 'nullable|exists:rent_bills,id',
            'utility_bill_id' => 'nullable|exists:utility_bills,id',
        ]);

        try {
            // Get the active tenancy for this tenant
            $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();
            
            if (!$activeTenancy) {
                return redirect()
                    ->back()
                    ->with('error', 'This tenant has no active tenancy.');
            }

            // Handle rent_bill_id for rent payments using the service
            $rentBillId = null;
            if ($validated['payment_type'] === 'rent') {
                $billLinkResult = $this->rentBillService->linkPaymentToBill(
                    $activeTenancy->id,
                    !empty($validated['rent_bill_id']) ? (int) $validated['rent_bill_id'] : null,
                    false // Not required - allows payments without bill
                );
                $rentBillId = $billLinkResult['rent_bill_id'];
            }

            // Prepare payment data
            $paymentData = [
                'tenant_id' => $tenant->id,
                'tenancy_id' => $activeTenancy->id,
                'rent_bill_id' => $rentBillId,
                'utility_bill_id' => $validated['utility_bill_id'] ?? null,
                'amount' => $validated['amount'],
                'payment_type' => $validated['payment_type'],
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'paid_at' => $validated['paid_at'],
            ];

            // Create payment with transactional bill processing if applicable
            $payment = null;
            if ($validated['payment_type'] === 'rent' && $rentBillId && in_array($validated['status'], ['paid', 'partial'])) {
                try {
                    $payment = $this->rentBillService->createPaymentWithRentBill(
                        $paymentData,
                        $rentBillId,
                        $validated['amount']
                    );
                } catch (\InvalidArgumentException $e) {
                    // Bill already processed, continue with payment but warn
                    $payment = Payment::create($paymentData);
                }
            } else if ($validated['payment_type'] === 'utility' && !empty($validated['utility_bill_id'])) {
                // Link utility payment
                $bill = UtilityBill::find($validated['utility_bill_id']);
                if ($bill) {
                    $this->utilityService->processUtilityPayment($bill, $validated['amount']);
                    // Update bill status if needed (processUtilityPayment already saves $bill)
                    $bill->refresh();
                    $paymentData['status'] = $bill->status;
                }
                $payment = Payment::create($paymentData);
            } else {
                // No bill linked or not applicable - create payment normally
                $payment = Payment::create($paymentData);
            }

            Log::info('Payment record created', [
                'payment_id' => $payment->id,
                'tenant_id' => $tenant->id,
                'amount' => $validated['amount'],
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $tenant->tenant_code])
                ->with('success', 'Payment record added successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to create payment record', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
                'validated_data' => $validated,
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to add payment record. Please try again.');
        }
    }

    /**
     * Update an existing payment record.
     *
     * @param Request $request
     * @param Payment $payment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Payment $payment)
    {
        $landlord = $request->user();
        
        // Authorization: ensure payment belongs to landlord's tenant
        $hasAccess = $payment->tenant()
            ->whereHas('tenancies.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to edit this payment record.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type' => ['required', Rule::in(['rent', 'utility'])],
            'payment_method' => 'required|string|max:255',
            'status' => ['required', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'required|date',
        ]);

        try {
            $payment->update($validated);

            Log::info('Payment record updated', [
                'payment_id' => $payment->id,
                'tenant_id' => $payment->tenant_id,
                'amount' => $validated['amount'],
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $payment->tenant->tenant_code])
                ->with('success', 'Payment record updated successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to update payment record', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'validated_data' => $validated,
            ]);

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update payment record. Please try again.');
        }
    }

    /**
     * Delete a payment record.
     *
     * @param Request $request
     * @param Payment $payment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request, Payment $payment)
    {
        $landlord = $request->user();
        
        // Authorization: ensure payment belongs to landlord's tenant
        $hasAccess = $payment->tenant()
            ->whereHas('tenancies.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to delete this payment record.');
        }

        try {
            $tenantCode = $payment->tenant->tenant_code;
            $payment->delete();

            Log::info('Payment record deleted', [
                'payment_id' => $payment->id,
                'tenant_id' => $payment->tenant_id,
                'landlord_id' => $landlord->id,
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $tenantCode])
                ->with('success', 'Payment record deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to delete payment record', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->with('error', 'Failed to delete payment record. Please try again.');
        }
    }
}
