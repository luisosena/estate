<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Enums\BillStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Landlord\TenancyUtilityStoreRequest;
use App\Http\Requests\Api\Landlord\TenancyUtilityUpdateRequest;
use App\Http\Resources\TenancyUtilityResource;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class TenancyUtilityController extends Controller
{
    /**
     * Get utilities for a specific tenancy.
     * GET /api/v1/landlord/tenancies/{tenancy}/utilities
     */
    public function index(Request $request, Tenancy $tenancy): AnonymousResourceCollection
    {
        $this->authorize('viewAny', TenancyUtility::class);
        $this->authorize('view', $tenancy);

        $utilities = $tenancy->tenancyUtilities()
            ->with('utilityType')
            ->orderBy('created_at', 'desc')
            ->get();

        return TenancyUtilityResource::collection($utilities);
    }

    /**
     * Assign a utility to a tenancy.
     * POST /api/v1/landlord/tenancies/{tenancy}/utilities
     */
    public function store(TenancyUtilityStoreRequest $request, Tenancy $tenancy): JsonResponse
    {
        $this->authorize('update', $tenancy); // landlord owns this tenancy
        $this->authorize('create', TenancyUtility::class); // landlord role can create

        $validated = $request->validated();

        try {
            $tenancyUtility = TenancyUtility::create([
                'tenancy_id' => $tenancy->id,
                'utility_type_id' => $validated['utility_type_id'],
                'amount' => $validated['amount'],
                'billing_cycle' => $validated['billing_cycle'],
                'provider' => $validated['provider'] ?? null,
                'account_number' => $validated['account_number'] ?? null,
                'meter_number' => $validated['meter_number'] ?? null,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            Log::info('Utility assigned to tenancy', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'tenancy_id' => $tenancy->id,
                'utility_type_id' => $validated['utility_type_id'],
                'landlord_id' => $request->user()->id,
            ]);

            return (new TenancyUtilityResource($tenancyUtility->load('utilityType')))
                ->additional(['message' => 'Utility assigned successfully'])
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            Log::error('Failed to assign utility to tenancy', [
                'tenancy_id' => $tenancy->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to assign utility',
            ], 500);
        }
    }

    /**
     * Get a single tenancy utility.
     * GET /api/v1/landlord/tenancy-utilities/{tenancyUtility}
     */
    public function show(Request $request, TenancyUtility $tenancyUtility): TenancyUtilityResource
    {
        $this->authorize('view', $tenancyUtility);

        $tenancyUtility->load(['utilityType', 'tenancy.unit.property']);

        return new TenancyUtilityResource($tenancyUtility);
    }

    /**
     * Update a tenancy utility.
     * PUT /api/v1/landlord/tenancy-utilities/{tenancyUtility}
     */
    public function update(TenancyUtilityUpdateRequest $request, TenancyUtility $tenancyUtility): TenancyUtilityResource|JsonResponse
    {
        $this->authorize('update', $tenancyUtility);

        $validated = $request->validated();

        try {
            $tenancyUtility->update($validated);

            Log::info('Tenancy utility updated', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'landlord_id' => $request->user()->id,
            ]);

            $tenancyUtility->load('utilityType');

            return (new TenancyUtilityResource($tenancyUtility))
                ->additional(['message' => 'Utility updated successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to update tenancy utility', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update utility',
            ], 500);
        }
    }

    /**
     * Remove a utility from a tenancy.
     * DELETE /api/v1/landlord/tenancy-utilities/{tenancyUtility}
     */
    public function destroy(Request $request, TenancyUtility $tenancyUtility): JsonResponse
    {
        $this->authorize('delete', $tenancyUtility);

        try {
            // Check for unpaid bills before deletion
            $unpaidBills = $tenancyUtility->bills()
                ->whereIn('status', [BillStatus::Pending->value, BillStatus::Partial->value, BillStatus::Overdue->value])
                ->exists();

            if ($unpaidBills) {
                return response()->json([
                    'message' => 'Cannot remove utility with unpaid bills. Please resolve outstanding bills first.',
                ], 422);
            }

            $tenancyUtility->delete();

            Log::info('Tenancy utility removed', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'landlord_id' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Utility removed successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to remove tenancy utility', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to remove utility',
            ], 500);
        }
    }
}
