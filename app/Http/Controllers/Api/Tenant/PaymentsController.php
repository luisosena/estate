<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Concerns\HandlesReceipts;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{
    use HandlesReceipts;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        $user = $request->user();
        $tenant = $user->tenant;

        // Get the active tenancy for payment calculations
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'unit.property'])
            ->first();

        // Get the most recent tenancy (active or ended) to show unit/property info if no active tenancy
        $latestTenancy = $tenant->tenancies()
            ->with(['unit', 'unit.property'])
            ->orderBy('created_at', 'desc')
            ->first();

        // Use active tenancy for unit/property info, fallback to latest if no active tenancy
        $displayTenancy = $activeTenancy ?? $latestTenancy;
        $unit = $displayTenancy?->unit;
        $property = $unit?->property;

        // Get payments from active tenancy only for privacy
        $paymentsQuery = $activeTenancy
            ? $activeTenancy->payments()
                ->with(['tenancy.unit', 'tenancy.unit.property'])
            : Payment::whereNull('id'); // Empty query if no active tenancy

        $payments = $paymentsQuery->get()
            ->sortByDesc('paid_at')
            ->map(function ($payment) use ($tenant, $unit, $property) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_type' => $payment->payment_type,
                    'payment_method' => $payment->payment_method,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                    'due_date' => $payment->due_date,
                    'created_at' => $payment->created_at,
                    'tenant_name' => $tenant->full_name,
                    'unit_number' => $unit?->unit_code,
                    'property_name' => $property?->name,
                ];
            })
            ->values() ?? collect();

        // Calculate pending amount from active tenancy rent payments only
        $pendingAmount = 0;
        $monthlyRent = $activeTenancy?->monthly_rent ?? 0;
        $totalPaid = $activeTenancy
            ? $activeTenancy->payments()
                ->whereIn('status', ['paid', 'partial'])
                ->where('payment_type', 'rent')
                ->sum('amount')
            : 0;
        $pendingAmount = max(0, $monthlyRent - $totalPaid);

        return response()->json([
            'data' => [
                'tenant' => [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                    'phone' => $tenant->phone,
                    'email' => $tenant->email,
                ],
                'payments' => $payments,
                'pending_amount' => $pendingAmount,
            ],
            'meta' => [
                'tenancy' => $displayTenancy ? [
                    'id' => $displayTenancy->id,
                    'monthly_rent' => $monthlyRent,
                    'status' => $activeTenancy ? 'active' : 'ended',
                ] : null,
            ],
        ]);
    }

    /**
     * Store a new payment.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Payment::class);

        $user = $request->user();
        $tenant = $user->tenant;

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:100000000',
            'payment_type' => 'required|in:rent,utility',
            'payment_method' => 'required|in:mobile_money,bank_transfer',
            'utility_bill_id' => 'required_if:payment_type,utility|nullable|exists:utility_bills,id',
            'rent_bill_id' => 'nullable|exists:rent_bills,id',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'message' => 'No active tenancy found.',
            ], 422);
        }

        try {
            $result = app(PaymentService::class)->processPayment($validated, $activeTenancy);

            if (isset($result['error'])) {
                return response()->json(['message' => $result['error']], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully!',
                'data' => [
                    'payment' => $result['payment'],
                    'excess_amount' => $result['excessAmount'] ?? 0,
                    'warning' => $result['warning'] ?? null,
                    'rent_bill_warning' => $result['rentBillError'] ?? null,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to process payment via API', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to process payment. Please try again.',
            ], 500);
        }
    }

    /**
     * Generate and download a payment receipt PDF.
     * GET /api/v1/tenant/payments/{paymentId}/receipt
     */
    public function receipt(Request $request, int $paymentId, ReceiptService $receiptService)
    {
        $payment = Payment::where('tenant_id', $request->user()->tenant_id)
            ->with(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill'])
            ->findOrFail($paymentId);
        $this->authorize('view', $payment);

        return $this->buildReceiptResponse($payment, $receiptService);
    }
}
