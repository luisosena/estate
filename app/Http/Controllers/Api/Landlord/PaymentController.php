<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
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
        ]);
    }

    /**
     * Create a new payment record.
     * POST /api/v1/landlord/payments
     */
    public function store(Request $request, \App\Services\PaymentService $paymentService)
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

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get the active tenancy for this tenant
        $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();
        
        if (!$activeTenancy) {
            return response()->json([
                'message' => 'This tenant has no active tenancy.',
            ], 422);
        }

        try {
            $result = $paymentService->processPayment($validated, $activeTenancy);

            $response = [
                'message' => 'Payment created successfully',
                'payment' => (new \App\Http\Resources\PaymentResource($result['payment']))->resolve(),
            ];

            if (!empty($result['warning'])) {
                $response['warning'] = $result['warning'];
            }

            return response()->json($response, 201);

        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
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
            'payment' => [
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
     * Get the receipt URL for a payment.
     */
    public function receipt(Request $request, $id, \App\Services\ReceiptService $receiptService)
    {
        $landlord = $request->user();
        
        $payment = Payment::with('tenancy.unit.property')->where('id', $id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        // Verify landlord owns the property this payment belongs to
        $hasAccess = optional(optional(optional($payment->tenancy)->unit)->property)->owner_id === $landlord->id;
        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized access to this payment receipt.'], 403);
        }

        if (!$payment->receipt_path) {
            // Generate it on the fly if it doesn't exist yet but is paid
            if ($payment->status === 'paid' || $payment->status === 'partial') {
                try {
                    $receiptService->generate($payment);
                    $payment->refresh();
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed generating receipt on the fly for {$payment->id}: " . $e->getMessage());
                    return response()->json(['message' => 'Failed to generate receipt.'], 500);
                }
            } else {
                return response()->json(['message' => 'Receipt not available for unpaid payments.'], 400);
            }
        }

        $url = $receiptService->getUrl($payment);

        if (!$url) {
            return response()->json(['message' => 'Unable to retrieve receipt url.'], 500);
        }

        return response()->json(['url' => $url]);
    }
}
