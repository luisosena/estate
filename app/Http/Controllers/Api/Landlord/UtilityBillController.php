<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\UtilityBill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UtilityBillController extends Controller
{
    /**
     * Get all utility bills for the landlord.
     * GET /api/v1/landlord/utility-bills
     */
    public function index(Request $request): JsonResponse
    {
        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        $query = UtilityBill::whereHas('tenancyUtility.tenancy.unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->with(['tenancyUtility.utilityType', 'tenancyUtility.tenancy.unit.property', 'payments']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('property_id')) {
            $query->whereHas('tenancyUtility.tenancy.unit', function ($q) use ($request) {
                $q->where('property_id', $request->property_id);
            });
        }

        if ($request->has('billing_month')) {
            $query->where('billing_month', $request->billing_month);
        }

        // Date range filter
        if ($request->has('from_month')) {
            $query->where('billing_month', '>=', $request->from_month);
        }

        if ($request->has('to_month')) {
            $query->where('billing_month', '<=', $request->to_month);
        }

        $totalItems = $query->count();
        $bills = $query->orderBy('billing_month', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        $totalPages = ceil($totalItems / $perPage);

        return response()->json([
            'data' => $bills,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ]);
    }

    /**
     * Get a single utility bill.
     * GET /api/v1/landlord/utility-bills/{utilityBill}
     */
    public function show(Request $request, UtilityBill $utilityBill): JsonResponse
    {
        $landlord = $request->user();

        // Verify landlord owns this utility bill - with null safety checks
        $property = $utilityBill->tenancyUtility?->tenancy?->unit?->property;
        if (!$property || $landlord->cannot('update', $property)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $utilityBill->load([
                'tenancyUtility.utilityType',
                'tenancyUtility.tenancy.unit.property',
                'payments' => function ($query) {
                    $query->orderBy('paid_at', 'desc');
                },
            ]),
        ]);
    }

    /**
     * Update a utility bill.
     * PUT /api/v1/landlord/utility-bills/{utilityBill}
     */
    public function update(Request $request, UtilityBill $utilityBill): JsonResponse
    {
        $landlord = $request->user();

        // Verify landlord owns this utility bill - with null safety checks
        $property = $utilityBill->tenancyUtility?->tenancy?->unit?->property;
        if (!$property || $landlord->cannot('update', $property)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount_due' => 'sometimes|numeric|min:0',
            'units_consumed' => 'nullable|numeric|min:0',
            'due_date' => 'sometimes|date',
            'status' => ['sometimes', Rule::in(['pending', 'paid', 'partial', 'overdue', 'waived'])],
            'notes' => 'nullable|string',
        ]);

        try {
            $utilityBill->update($validated);

            Log::info('Utility bill updated', [
                'utility_bill_id' => $utilityBill->id,
                'landlord_id' => $landlord->id,
            ]);

            return response()->json([
                'message' => 'Utility bill updated successfully',
                'data' => $utilityBill->load('tenancyUtility.utilityType'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update utility bill', [
                'utility_bill_id' => $utilityBill->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update utility bill',
            ], 500);
        }
    }

    /**
     * Waive a utility bill.
     * POST /api/v1/landlord/utility-bills/{utilityBill}/waive
     */
    public function waive(Request $request, UtilityBill $utilityBill): JsonResponse
    {
        $landlord = $request->user();

        // Verify landlord owns this utility bill - with null safety checks
        $property = $utilityBill->tenancyUtility?->tenancy?->unit?->property;
        if (!$property || $landlord->cannot('update', $property)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Check if already paid or waived
            if (in_array($utilityBill->status, ['paid', 'waived'])) {
                return response()->json([
                    'message' => 'This bill cannot be waived because it is already ' . $utilityBill->status,
                ], 422);
            }

            $utilityBill->update([
                'status' => 'waived',
                'notes' => ($utilityBill->notes ? $utilityBill->notes . '\n\n' : '') .
                    'Waived by landlord on ' . now()->format('Y-m-d H:i:s'),
            ]);

            Log::info('Utility bill waived', [
                'utility_bill_id' => $utilityBill->id,
                'landlord_id' => $landlord->id,
            ]);

            return response()->json([
                'message' => 'Utility bill waived successfully',
                'data' => $utilityBill->fresh('tenancyUtility.utilityType'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to waive utility bill', [
                'utility_bill_id' => $utilityBill->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to waive utility bill',
            ], 500);
        }
    }
}
