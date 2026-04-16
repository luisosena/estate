<?php

namespace App\Http\Controllers\Web\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\UtilityBill;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\TenancyResource;
use App\Http\Resources\TenantResource;
use App\Http\Resources\UtilityBillResource;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\UtilityService;

class TenantPaymentsController extends Controller
{
    protected $utilityService;

    public function __construct(UtilityService $utilityService)
    {
        $this->utilityService = $utilityService;
    }

    /**
     * Display a listing of payments for the tenant.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        $payments = [];
        if ($activeTenancy) {
            $payments = $activeTenancy->payments()
                ->orderByDesc('paid_at')
                ->paginate(15);
        }

        // Calculate pending amount
        $pendingAmount = 0;
        $monthlyRent = 0;
        if ($activeTenancy) {
            $monthlyRent = $activeTenancy->monthly_rent ?? 0;
            // Only consider rent payments for pending amount calculation
            $totalPaid = $activeTenancy->payments()
                ->whereIn('status', ['paid', 'partial'])
                ->where('payment_type', 'rent')
                ->sum('amount');
            $pendingAmount = max(0, $monthlyRent - $totalPaid);
        }

        return Inertia::render('tenant/payments/index', [
            'tenant' => new TenantResource($tenant),
            'tenancy' => $activeTenancy ? new TenancyResource($activeTenancy) : null,
            'payments' => $activeTenancy ? PaymentResource::collection($payments) : null,
            'pendingAmount' => $pendingAmount,
        ]);
    }

    /**
     * Show the make payment page.
     */
    public function makePayment(Request $request, ?int $paymentId = null)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
            return redirect()
                ->route('tenant.payments')
                ->with('error', 'No active tenancy found.');
        }

        $existingPayment = null;
        if ($paymentId) {
            $existingPayment = $activeTenancy->payments()->find($paymentId);
        }

        // Calculate pending amount
        $monthlyRent = $activeTenancy->monthly_rent ?? 0;
        $totalPaid = $activeTenancy->payments()
            ->whereIn('status', ['paid', 'partial'])
            ->where('payment_type', 'rent')
            ->sum('amount');
        $pendingAmount = max(0, $monthlyRent - $totalPaid);

        // Fetch pending utility bills
        $pendingUtilityBills = UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
                $q->where('tenancy_id', $activeTenancy->id);
            })
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->with('tenancyUtility.utilityType')
            ->orderBy('due_date', 'asc')
            ->get();

        return Inertia::render('tenant/payments/make', [
            'tenant' => new TenantResource($tenant),
            'tenancy' => new TenancyResource($activeTenancy),
            'existingPayment' => $existingPayment ? new PaymentResource($existingPayment) : null,
            'pendingAmount' => $pendingAmount,
            'pendingUtilityBills' => UtilityBillResource::collection($pendingUtilityBills),
            'paymentMethods' => [
                ['value' => 'mobile_money', 'label' => 'Mobile Money'],
                ['value' => 'bank_transfer', 'label' => 'Bank Transfer'],
            ],
        ]);
    }

    /**
     * Store a new payment or update existing.
     */
    public function storePayment(Request $request, ?Payment $payment = null)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:100000000',
            'payment_type' => 'required|in:rent,utility',
            'payment_method' => 'required|in:mobile_money,bank_transfer',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
            'utility_bill_id' => 'nullable|exists:utility_bills,id',
        ]);

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
            return redirect()
                ->route('tenant.payments')
                ->with('error', 'No active tenancy found.');
        }

        // Get the existing payment if updating
        $existingPayment = $payment;

        // Security check
        if ($existingPayment && $existingPayment->tenant_id !== $tenant->id) {
            abort(403, 'Unauthorized access to this payment.');
        }

        try {
            $result = DB::transaction(function () use ($activeTenancy, $validated, $existingPayment, $tenant) {
                // Duplicate prevention
                $recentDuplicate = $activeTenancy->payments()
                    ->where('amount', $validated['amount'])
                    ->where('payment_method', $validated['payment_method'])
                    ->where('payment_type', $validated['payment_type'])
                    ->where('created_at', '>=', now()->subSeconds(30))
                    ->exists();

                if ($recentDuplicate && !$existingPayment) {
                    return ['error' => 'A duplicate payment was recently submitted. Please wait a moment.'];
                }

                $monthlyRent = $activeTenancy->monthly_rent ?? 0;
                $status = 'partial';
                $utilityBillId = $validated['utility_bill_id'] ?? null;

                if ($validated['payment_type'] === 'utility' && $utilityBillId) {
                    $bill = UtilityBill::find($utilityBillId);
                    if ($bill) {
                        $this->utilityService->processUtilityPayment($bill, $validated['amount']);
                        $bill->refresh();
                        $status = $bill->status;
                    }
                } else if ($validated['payment_type'] === 'rent') {
                    $currentTotalPaid = $activeTenancy->payments()
                        ->whereIn('status', ['paid', 'partial'])
                        ->where('payment_type', 'rent')
                        ->when($existingPayment, fn($q) => $q->where('id', '!=', $existingPayment->id))
                        ->sum('amount');
                    
                    if ($currentTotalPaid + $validated['amount'] >= $monthlyRent) {
                        $status = 'paid';
                    }
                }

                // Create or update payment
                $paymentData = [
                    'tenant_id' => $tenant->id,
                    'tenancy_id' => $activeTenancy->id,
                    'utility_bill_id' => $utilityBillId,
                    'amount' => $validated['amount'],
                    'payment_type' => $validated['payment_type'],
                    'payment_method' => $validated['payment_method'],
                    'status' => $status,
                    'paid_at' => now(),
                    'reference_number' => $validated['reference_number'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ];

                if ($existingPayment) {
                    $existingPayment->update($paymentData);
                    $payment = $existingPayment;
                } else {
                    $payment = Payment::create($paymentData);
                }

                return ['success' => true, 'payment' => $payment];
            });

            if (isset($result['error'])) {
                return redirect()->back()->withInput()->with('error', $result['error']);
            }

            return redirect()
                ->route('tenant.payments')
                ->with('success', 'Payment processed successfully!');

        } catch (\Exception $e) {
            Log::error('Payment processing failed: ' . $e->getMessage());
            return redirect()->back()->withInput()->with('error', 'Failed to process payment.');
        }
    }
}
