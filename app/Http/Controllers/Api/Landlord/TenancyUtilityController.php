<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TenancyUtilityController extends Controller
{
    /**
     * Get utilities for a specific tenancy.
     * GET /api/v1/landlord/tenancies/{tenancy}/utilities
     */
    public function index(Request $request, Tenancy $tenancy): JsonResponse
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy - with null safety checks
        $property = $tenancy->unit?->property;
        if (! $property || $property->owner_id !== $landlord->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $utilities = $tenancy->tenancyUtilities()
            ->with('utilityType')
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedUtilities = $utilities->map(function ($utility) {
            return [
                'id' => $utility->id,
                'tenancy_id' => $utility->tenancy_id,
                'utility_type_id' => $utility->utility_type_id,
                'utility_type' => $utility->utilityType ? [
                    'id' => $utility->utilityType->id,
                    'name' => $utility->utilityType->name,
                    'unit' => $utility->utilityType->unit,
                ] : null,
                'amount' => $utility->amount,
                'billing_cycle' => $utility->billing_cycle,
                'provider' => $utility->provider,
                'account_number' => $utility->account_number,
                'meter_number' => $utility->meter_number,
                'status' => $utility->status,
                'notes' => $utility->notes,
                'created_at' => $utility->created_at,
                'updated_at' => $utility->updated_at,
            ];
        });

        return response()->json([
            'data' => $formattedUtilities,
        ]);
    }

    /**
     * Assign a utility to a tenancy.
     * POST /api/v1/landlord/tenancies/{tenancy}/utilities
     */
    public function store(Request $request, Tenancy $tenancy): JsonResponse
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy - with null safety checks
        $property = $tenancy->unit?->property;
        if (! $property || $property->owner_id !== $landlord->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'utility_type_id' => [
                'required',
                'exists:utility_types,id',
                Rule::unique('tenancy_utilities')->where('tenancy_id', $tenancy->id),
            ],
            'amount' => 'required|numeric|min:0',
            'billing_cycle' => ['required', Rule::in(['monthly', 'quarterly', 'annual'])],
            'provider' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'meter_number' => 'nullable|string|max:100',
            'status' => ['required', Rule::in(['active', 'suspended', 'disconnected'])],
            'notes' => 'nullable|string',
        ]);

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
                'landlord_id' => $landlord->id,
            ]);

            return response()->json([
                'message' => 'Utility assigned successfully',
                'data' => [
                    'id' => $tenancyUtility->id,
                    'tenancy_id' => $tenancyUtility->tenancy_id,
                    'utility_type_id' => $tenancyUtility->utility_type_id,
                    'utility_type' => $tenancyUtility->utilityType ? [
                        'id' => $tenancyUtility->utilityType->id,
                        'name' => $tenancyUtility->utilityType->name,
                        'unit' => $tenancyUtility->utilityType->unit,
                    ] : null,
                    'amount' => $tenancyUtility->amount,
                    'status' => $tenancyUtility->status,
                    'notes' => $tenancyUtility->notes,
                    'created_at' => $tenancyUtility->created_at,
                    'updated_at' => $tenancyUtility->updated_at,
                ],
            ], 201);
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
    public function show(Request $request, TenancyUtility $tenancyUtility): JsonResponse
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy utility - with null safety checks
        $property = $tenancyUtility->tenancy?->unit?->property;
        if (! $property || $property->owner_id !== $landlord->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tenancyUtility->load(['utilityType', 'tenancy.unit.property']);

        return response()->json([
            'data' => [
                'id' => $tenancyUtility->id,
                'tenancy_id' => $tenancyUtility->tenancy_id,
                'unit_id' => $tenancyUtility->tenancy?->unit?->id,
                'unit_code' => $tenancyUtility->tenancy?->unit?->unit_code,
                'property_id' => $tenancyUtility->tenancy?->unit?->property?->id,
                'property_name' => $tenancyUtility->tenancy?->unit?->property?->name,
                'utility_type_id' => $tenancyUtility->utility_type_id,
                'utility_type' => $tenancyUtility->utilityType ? [
                    'id' => $tenancyUtility->utilityType->id,
                    'name' => $tenancyUtility->utilityType->name,
                    'unit' => $tenancyUtility->utilityType->unit,
                ] : null,
                'amount' => $tenancyUtility->amount,
                'billing_cycle' => $tenancyUtility->billing_cycle,
                'provider' => $tenancyUtility->provider,
                'account_number' => $tenancyUtility->account_number,
                'meter_number' => $tenancyUtility->meter_number,
                'status' => $tenancyUtility->status,
                'notes' => $tenancyUtility->notes,
                'created_at' => $tenancyUtility->created_at,
                'updated_at' => $tenancyUtility->updated_at,
            ],
        ]);
    }

    /**
     * Update a tenancy utility.
     * PUT /api/v1/landlord/tenancy-utilities/{tenancyUtility}
     */
    public function update(Request $request, TenancyUtility $tenancyUtility): JsonResponse
    {
        $landlord = $request->user();

        // Verify landlord owns this tenancy utility - with null safety checks
        $property = $tenancyUtility->tenancy?->unit?->property;
        if (! $property || $property->owner_id !== $landlord->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'billing_cycle' => ['sometimes', Rule::in(['monthly', 'quarterly', 'annual'])],
            'provider' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'meter_number' => 'nullable|string|max:100',
            'status' => ['sometimes', Rule::in(['active', 'suspended', 'disconnected'])],
            'notes' => 'nullable|string',
        ]);

        try {
            $tenancyUtility->update($validated);

            Log::info('Tenancy utility updated', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'landlord_id' => $landlord->id,
            ]);

            $tenancyUtility->load('utilityType');

            return response()->json([
                'message' => 'Utility updated successfully',
                'data' => [
                    'id' => $tenancyUtility->id,
                    'tenancy_id' => $tenancyUtility->tenancy_id,
                    'utility_type_id' => $tenancyUtility->utility_type_id,
                    'utility_type' => $tenancyUtility->utilityType ? [
                        'id' => $tenancyUtility->utilityType->id,
                        'name' => $tenancyUtility->utilityType->name,
                        'unit' => $tenancyUtility->utilityType->unit,
                    ] : null,
                    'amount' => $tenancyUtility->amount,
                    'billing_cycle' => $tenancyUtility->billing_cycle,
                    'provider' => $tenancyUtility->provider,
                    'account_number' => $tenancyUtility->account_number,
                    'meter_number' => $tenancyUtility->meter_number,
                    'status' => $tenancyUtility->status,
                    'notes' => $tenancyUtility->notes,
                    'created_at' => $tenancyUtility->created_at,
                    'updated_at' => $tenancyUtility->updated_at,
                ],
            ]);
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
        $landlord = $request->user();

        // Verify landlord owns this tenancy utility - with null safety checks
        $property = $tenancyUtility->tenancy?->unit?->property;
        if (! $property || $property->owner_id !== $landlord->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Check for unpaid bills before deletion
            $unpaidBills = $tenancyUtility->bills()
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->exists();

            if ($unpaidBills) {
                return response()->json([
                    'message' => 'Cannot remove utility with unpaid bills. Please resolve outstanding bills first.',
                ], 422);
            }

            $tenancyUtility->delete();

            Log::info('Tenancy utility removed', [
                'tenancy_utility_id' => $tenancyUtility->id,
                'landlord_id' => $landlord->id,
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
