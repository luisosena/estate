<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Enums\BillStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Concerns\HandlesReceipts;
use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\PaymentStoreRequest;
use App\Http\Requests\Landlord\PaymentUpdateRequest;
use App\Http\Requests\Landlord\RecordPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\UtilityBill;
use App\Services\ReceiptService;
use App\Services\RentBillService;
use App\Services\UtilityService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class LandlordPaymentController extends Controller
{
    use HandlesReceipts;

    protected RentBillService $rentBillService;

    protected UtilityService $utilityService;

    public function __construct(RentBillService $rentBillService, UtilityService $utilityService)
    {
        $this->rentBillService = $rentBillService;
        $this->utilityService = $utilityService;
        // Authorization handled explicitly in methods
    }

    /**
     * Display a listing of payments for the landlord.
     *
     * @return Response
     */
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', Payment::class);

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
     * @param  Request  $request
     * @return RedirectResponse
     */
    public function store(PaymentStoreRequest $request, Tenant $tenant)
    {
        $this->authorize('update', $tenant);

        $landlord = $request->user();

        $validated = $request->validated();

        try {
            // Get the active tenancy for this tenant
            $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();

            if (! $activeTenancy) {
                return redirect()
                    ->back()
                    ->with('error', 'This tenant has no active tenancy.');
            }

            // Handle rent_bill_id for rent payments using the service
            $rentBillId = null;
            if ($validated['payment_type'] === 'rent') {
                $billLinkResult = $this->rentBillService->linkPaymentToBill(
                    $activeTenancy->id,
                    ! empty($validated['rent_bill_id']) ? (int) $validated['rent_bill_id'] : null,
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
            } elseif ($validated['payment_type'] === 'utility' && ! empty($validated['utility_bill_id'])) {
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
     * @param  Request  $request
     * @return RedirectResponse
     */
    public function update(PaymentUpdateRequest $request, Payment $payment)
    {
        $this->authorize('update', $payment);

        $landlord = $request->user();

        $validated = $request->validated();

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
     * @return RedirectResponse
     */
    public function destroy(Request $request, Payment $payment)
    {
        $this->authorize('delete', $payment);

        $landlord = $request->user();

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

    /**
     * Record a multi-bill manual payment for a tenant.
     */
    public function recordPayment(RecordPaymentRequest $request, Tenant $tenant): RedirectResponse
    {
        $this->authorize('update', $tenant);

        $landlord = $request->user();
        $validated = $request->validated();

        $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();
        if (! $activeTenancy) {
            return redirect()->back()->with('error', 'This tenant has no active tenancy.');
        }

        try {
            $result = DB::transaction(function () use ($validated, $activeTenancy, $tenant, $landlord) {
                // 1. On-demand bill creation
                $billIds = $validated['rent_bill_ids'] ?? [];
                $billingMonths = $validated['billing_months'] ?? [];

                foreach ($billingMonths as $month) {
                    $billingMonth = Carbon::parse($month.'-01')->startOfMonth();
                    $existing = RentBill::where('tenancy_id', $activeTenancy->id)
                        ->where('billing_month', $billingMonth)
                        ->first();

                    if (! $existing) {
                        $newBill = RentBill::create([
                            'tenancy_id' => $activeTenancy->id,
                            'billing_month' => $billingMonth,
                            'amount_due' => $activeTenancy->monthly_rent,
                            'amount_paid' => 0,
                            'due_date' => $billingMonth->copy()->endOfMonth(),
                            'status' => 'pending',
                        ]);
                        $billIds[] = $newBill->id;
                    } else {
                        $billIds[] = $existing->id;
                    }
                }

                // 2. Fetch bills ordered by billing_month ASC
                $bills = RentBill::whereIn('id', $billIds)
                    ->where('tenancy_id', $activeTenancy->id)
                    ->orderBy('billing_month')
                    ->get();

                // 3. Validate bills are payable
                foreach ($bills as $bill) {
                    if (in_array($bill->status, [BillStatus::Paid, BillStatus::Waived])) {
                        throw new \InvalidArgumentException(
                            "Bill for {$bill->billing_month->format('M Y')} is already {$bill->status->value}."
                        );
                    }
                }

                // 4. Sequential allocation
                $totalAmount = (float) $validated['amount'];
                $remaining = $totalAmount;
                $allocations = [];

                foreach ($bills as $i => $bill) {
                    $outstanding = (float) $bill->outstanding_amount;
                    $allocated = min($remaining, $outstanding);
                    $remaining -= $allocated;
                    $allocations[$bill->id] = $allocated;
                }

                // 5. Overpayment -> add to last bill
                if ($remaining > 0 && ! empty($allocations)) {
                    $lastBillId = array_key_last($allocations);
                    $allocations[$lastBillId] += $remaining;
                }

                // 6. Create payment records + process bills
                $payments = [];
                foreach ($allocations as $billId => $allocated) {
                    if ($allocated <= 0) {
                        continue;
                    }

                    $bill = $bills->firstWhere('id', $billId);
                    $outstanding = (float) $bill->outstanding_amount;

                    $status = $allocated >= $outstanding ? 'paid' : 'partial';

                    $paymentData = [
                        'tenant_id' => $tenant->id,
                        'tenancy_id' => $activeTenancy->id,
                        'rent_bill_id' => $billId,
                        'amount' => $allocated,
                        'payment_type' => 'rent',
                        'payment_method' => $validated['payment_method'],
                        'status' => $status,
                        'paid_at' => now(),
                        'recorded_by' => $landlord->id,
                        'reference_number' => $validated['reference_number'] ?? null,
                        'notes' => $validated['notes'] ?? null,
                    ];

                    $payment = Payment::create($paymentData);
                    $this->rentBillService->processRentPayment($bill, $allocated);

                    // Sync payment status from bill (source of truth)
                    $bill->refresh();
                    $payment->status = PaymentStatus::from($bill->status->value);
                    $payment->save();

                    $payments[] = $payment;
                }

                return $payments;
            });

            $paymentIds = collect($result)->pluck('id')->toArray();

            Log::info('Manual payment recorded', [
                'tenant_id' => $tenant->id,
                'landlord_id' => $landlord->id,
                'payment_ids' => $paymentIds,
                'total_amount' => $validated['amount'],
            ]);

            return redirect()
                ->route('landlord.tenants.show', ['tenant' => $tenant->tenant_code])
                ->with('success', 'Payment recorded successfully.')
                ->with('recorded_payment_ids', $paymentIds);

        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Failed to record manual payment', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Failed to record payment. Please try again.');
        }
    }

    /**
     * Stream a PDF receipt for a payment owned by the landlord.
     */
    public function receipt(Request $request, int $paymentId, ReceiptService $receiptService): Response
    {
        $landlord = $request->user();

        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })->findOrFail($paymentId);

        return $this->buildReceiptResponse($payment, $receiptService);
    }
}
