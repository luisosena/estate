<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Concerns\HandlesReceipts;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use App\Services\ReceiptService;
use App\Services\RentBillService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    use HandlesReceipts;

    protected RentBillService $rentBillService;

    public function __construct(RentBillService $rentBillService)
    {
        $this->rentBillService = $rentBillService;
    }

    /**
     * Get all payments for the landlord.
     * GET /api/v1/landlord/payments
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        $query = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with(['tenant:id,full_name,tenant_code', 'tenancy:id,unit_id', 'tenancy.unit:id,unit_code,property_id', 'tenancy.unit.property:id,name', 'rentBill:id,billing_month,status'])
            ->orderBy('paid_at', 'desc');

        $totalItems = $query->count();
        $payments = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_type' => $payment->payment_type,
                    'payment_method' => $payment->payment_method,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                    'due_date' => $payment->due_date,
                    'created_at' => $payment->created_at,
                    'tenant_name' => $payment->tenant?->full_name,
                    'tenant_code' => $payment->tenant?->tenant_code,
                    'unit_number' => $payment->tenancy?->unit?->unit_code,
                    'property_name' => $payment->tenancy?->unit?->property?->name,
                    'rent_bill_id' => $payment->rent_bill_id,
                    'rent_bill' => $payment->rentBill ? [
                        'id' => $payment->rentBill->id,
                        'billing_month' => $payment->rentBill->billing_month->format('Y-m'),
                        'status' => $payment->rentBill->status,
                    ] : null,
                ];
            });

        $totalPages = ceil($totalItems / $perPage);

        return response()->json([
            'data' => $payments,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ]);
    }

    /**
     * Get a single payment.
     * GET /api/v1/landlord/payments/{payment}
     */
    public function show(Request $request, int $paymentId)
    {
        $landlord = $request->user();

        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with(['tenant', 'tenancy.unit'])
            ->findOrFail($paymentId);

        return response()->json([
            'data' => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_type' => $payment->payment_type,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at,
                'due_date' => $payment->due_date,
                'created_at' => $payment->created_at,
                'tenant_name' => $payment->tenant?->full_name,
                'tenant_code' => $payment->tenant?->tenant_code,
                'unit_number' => $payment->tenancy?->unit?->unit_code,
                'property_name' => $payment->tenancy?->unit?->property?->name,
            ],
        ]);
    }

    /**
     * Create a new payment record.
     * POST /api/v1/landlord/payments
     */
    public function store(Request $request)
    {
        $landlord = $request->user();

        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'amount' => 'required|numeric|min:0',
            'payment_type' => ['required', Rule::in(['rent', 'utility'])],
            'payment_method' => 'required|string|max:255',
            'status' => ['required', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'required|date',
            'rent_bill_id' => 'nullable|exists:rent_bills,id',
        ]);

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
    public function update(Request $request, int $paymentId)
    {
        $landlord = $request->user();

        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->findOrFail($paymentId);

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
        $landlord = $request->user();

        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->findOrFail($paymentId);

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
        $landlord = $request->user();

        $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill'])
            ->findOrFail($paymentId);

        return $this->buildReceiptResponse($payment, $receiptService);
    }
}
