<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Contracts\PaymentServiceInterface;
use App\Http\Controllers\Concerns\HandlesReceipts;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Tenant\PaymentStoreRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\ReceiptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{
    use HandlesReceipts;

    public function __construct(
        protected PaymentServiceInterface $paymentService
    ) {}

    public function index(Request $request): JsonResponse
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

        // Get payments from active tenancy only for privacy
        $paymentsQuery = $activeTenancy
            ? $activeTenancy->payments()
                ->with(['tenant', 'tenancy.unit', 'tenancy.unit.property'])
            : Payment::whereNull('id'); // Empty query if no active tenancy

        $payments = $paymentsQuery->get()->sortByDesc('paid_at');

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
                'payments' => PaymentResource::collection($payments),
                'tenant' => [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                    'phone' => $tenant->phone,
                    'email' => $tenant->email,
                ],
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
    public function store(PaymentStoreRequest $request): JsonResponse
    {
        $this->authorize('create', Payment::class);

        $user = $request->user();
        $tenant = $user->tenant;

        $validated = $request->validated();

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'message' => 'No active tenancy found.',
            ], 422);
        }

        try {
            $result = $this->paymentService->processPayment($validated, $activeTenancy);

            if (isset($result['error'])) {
                return response()->json(['message' => $result['error']], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully!',
                'data' => [
                    'payment' => new PaymentResource($result['payment']->load(['tenant', 'tenancy.unit', 'tenancy.unit.property'])),
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
    public function receipt(Request $request, int $paymentId, ReceiptService $receiptService): Response
    {
        $payment = Payment::where('tenant_id', $request->user()->tenant_id)
            ->with(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill'])
            ->findOrFail($paymentId);
        $this->authorize('view', $payment);

        return $this->buildReceiptResponse($payment, $receiptService);
    }
}
