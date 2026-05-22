<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Enums\BillStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Landlord\UtilityBillUpdateRequest;
use App\Http\Resources\UtilityBillResource;
use App\Models\UtilityBill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class UtilityBillController extends Controller
{
    /**
     * Get all utility bills for the landlord.
     * GET /api/v1/landlord/utility-bills
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', UtilityBill::class);

        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        $query = UtilityBill::whereHas('tenancyUtility.tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with([
                'tenancyUtility.utilityType',
                'tenancyUtility.tenancy.unit.property',
                'tenancyUtility.tenancy.tenant', // Ensure tenant is loaded for Tenancy->tenant_code
                'payments.tenant',               // Ensure tenant is loaded for Payment->tenant_code
            ]);

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

        $bills = $query->orderBy('billing_month', 'desc')->paginate($perPage);

        return UtilityBillResource::collection($bills);
    }

    /**
     * Get a single utility bill.
     * GET /api/v1/landlord/utility-bills/{utilityBill}
     */
    public function show(Request $request, UtilityBill $utilityBill): UtilityBillResource
    {
        $this->authorize('view', $utilityBill);

        $utilityBill->load([
            'tenancyUtility.utilityType',
            'tenancyUtility.tenancy.unit.property',
            'tenancyUtility.tenancy.tenant',
            'payments' => function ($query) {
                $query->orderBy('paid_at', 'desc');
            },
        ]);

        return new UtilityBillResource($utilityBill);
    }

    /**
     * Update a utility bill.
     * PUT /api/v1/landlord/utility-bills/{utilityBill}
     */
    public function update(UtilityBillUpdateRequest $request, UtilityBill $utilityBill): UtilityBillResource|JsonResponse
    {
        $this->authorize('update', $utilityBill);

        $validated = $request->validated();

        try {
            $utilityBill->update($validated);

            Log::info('Utility bill updated', [
                'utility_bill_id' => $utilityBill->id,
                'landlord_id' => $request->user()->id,
            ]);

            return (new UtilityBillResource($utilityBill))
                ->additional(['message' => 'Utility bill updated successfully']);
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
    public function waive(Request $request, UtilityBill $utilityBill): UtilityBillResource|JsonResponse
    {
        $this->authorize('waive', $utilityBill);

        try {
            // Check if already paid or waived
            if (in_array($utilityBill->status, [BillStatus::Paid, BillStatus::Waived])) {
                return response()->json([
                    'message' => 'This bill cannot be waived because it is already '.$utilityBill->status->value,
                ], 422);
            }

            $utilityBill->update([
                'status' => BillStatus::Waived,
                'notes' => ($utilityBill->notes ? $utilityBill->notes.'\n\n' : '').
                    'Waived by landlord on '.now()->format('Y-m-d H:i:s'),
            ]);

            Log::info('Utility bill waived', [
                'utility_bill_id' => $utilityBill->id,
                'landlord_id' => $request->user()->id,
            ]);

            return (new UtilityBillResource($utilityBill))
                ->additional(['message' => 'Utility bill waived successfully']);
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
