<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Contracts\RentBillServiceInterface;
use App\Http\Controllers\Concerns\HandlesReceipts;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Landlord\PaymentStoreRequest;
use App\Http\Requests\Api\Landlord\PaymentUpdateRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\Tenant;
use App\Services\ReceiptService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    use HandlesReceipts;

    public function __construct(
        protected RentBillServiceInterface $rentBillService
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        $query = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with(['tenant:id,full_name,tenant_code', 'tenancy:id,unit_id', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name', 'rentBill:id,billing_month,status'])
            ->orderBy('paid_at', 'desc');

        $payments = $query->paginate($perPage);

        return PaymentResource::collection($payments);
    }

    public function show(Request $request, int $paymentId)
    {
        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->with(['tenant', 'tenancy.unit'])->findOrFail($paymentId);
        $this->authorize('view', $payment);

        return new PaymentResource($payment);
    }

    public function store(PaymentStoreRequest $request)
    {
        $this->authorize('create', Payment::class);

        $landlord = $request->user();

        $validated = $request->validated();

        // Verify tenant belongs to landlord's property
        $tenant = Tenant::findOrFail($validated['tenant_id']);

        $hasAccess = $tenant->tenancies()
            ->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->exists();

        if (! $hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get the active tenancy for this tenant
        $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();

        if (! $activeTenancy) {
            return response()->json([
                'message' => 'This tenant has no active tenancy.',
            ], 422);
        }

        // Handle rent_bill_id for rent payments using the service
        $rentBillId = null;
        $rentBillWarning = null;
        if ($validated['payment_type'] === 'rent') {
            $billLinkResult = $this->rentBillService->linkPaymentToBill(
                $activeTenancy->id,
                ! empty($validated['rent_bill_id']) ? (int) $validated['rent_bill_id'] : null,
                false // Not required - allows payments without bill
            );
            $rentBillId = $billLinkResult['rent_bill_id'];
            if ($billLinkResult['error']) {
                $rentBillWarning = $billLinkResult['error'].' Using current month bill instead.';
            }
        }

        // Prepare payment data
        $paymentData = [
            'tenant_id' => $tenant->id,
            'tenancy_id' => $activeTenancy->id,
            'rent_bill_id' => $rentBillId,
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
            'payment_method' => $validated['payment_method'],
            'status' => $validated['status'],
            'paid_at' => $validated['paid_at'],
        ];

        // Create payment with transactional rent bill processing if applicable
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
                $rentBillWarning = $e->getMessage();
                $payment = Payment::create($paymentData);
            }
        } else {
            // No rent bill linked or not applicable - create payment normally
            $payment = Payment::create($paymentData);
        }

        $response = [
            'message' => 'Payment created successfully',
            'data' => [
                'id' => $payment->id,
                'tenant_id' => $payment->tenant_id,
                'tenancy_id' => $payment->tenancy_id,
                'rent_bill_id' => $payment->rent_bill_id,
                'amount' => $payment->amount,
                'payment_type' => $payment->payment_type,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at,
                'created_at' => $payment->created_at,
            ],
        ];

        // Include warning if rent bill was not found as specified
        if ($rentBillWarning) {
            $response['warning'] = $rentBillWarning;
        }

        return response()->json($response, 201);
    }

    /**
     * Update a payment.
     * PUT /api/v1/landlord/payments/{payment}
     */
    public function update(Request $request, int $paymentId, PaymentUpdateRequest $requestUpdate)
    {
        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->with(['tenancy.unit.property'])->findOrFail($paymentId);
        $this->authorize('update', $payment);

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'payment_type' => ['sometimes', Rule::in(['rent', 'utility'])],
            'payment_method' => 'sometimes|string|max:255',
            'status' => ['sometimes', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'sometimes|date',
        ]);

        $payment->update($validated);

        return response()->json([
            'message' => 'Payment updated successfully',
            'data' => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_type' => $payment->payment_type,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at,
                'updated_at' => $payment->updated_at,
            ],
        ]);
    }

    /**
     * Delete a payment.
     * DELETE /api/v1/landlord/payments/{payment}
     */
    public function destroy(Request $request, int $paymentId)
    {
        $payment = Payment::where('id', $paymentId)
            ->whereHas('tenancy.unit.property', function ($query) use ($request) {
                $query->where('owner_id', $request->user()->id);
            })
            ->firstOrFail();

        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted successfully',
        ]);
    }

    /**
     * Generate and download a payment receipt PDF.
     * GET /api/v1/landlord/payments/{paymentId}/receipt
     */
    public function receipt(Request $request, int $paymentId, ReceiptService $receiptService)
    {
        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->with(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill'])
            ->findOrFail($paymentId);
        $this->authorize('view', $payment);

        return $this->buildReceiptResponse($payment, $receiptService);
    }
}
