<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UnitController extends Controller
{
    /**
     * Get all units for the landlord.
     * GET /api/v1/landlord/units
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);
        $propertyId = $request->get('property_id');

        $query = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
        ->with('property:id,name');

        if ($propertyId) {
            $query->where('property_id', $propertyId);
        }

        // Get total counts for stats before pagination
        $allUnits = $query->get();
        $totalUnits = $allUnits->count();
        $availableUnits = $allUnits->where('status', 'available')->count();
        $occupiedUnits = $allUnits->where('status', 'occupied')->count();
        $occupancyRate = $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0;

        // Use database-level pagination
        $units = $query->orderBy('property_id')
            ->orderBy('unit_code')
            ->paginate($perPage, ['*'], 'page', $page);

        $formattedUnits = $units->getCollection()->map(function ($unit) {
            return [
                'id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'unit_name' => $unit->unit_name,
                'status' => $unit->status,
                'property' => [
                    'id' => $unit->property->id,
                    'name' => $unit->property->name,
                ],
                'created_at' => $unit->created_at->format('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'data' => $formattedUnits,
            'meta' => [
                'current_page' => $units->currentPage(),
                'per_page' => $units->perPage(),
                'total' => $units->total(),
                'total_pages' => $units->lastPage(),
            ],
            'stats' => [
                'total_units' => $totalUnits,
                'available_units' => $availableUnits,
                'occupied_units' => $occupiedUnits,
                'occupancy_rate' => $occupancyRate,
            ],
        ]);
    }

    /**
     * Get a single unit.
     * GET /api/v1/landlord/units/{unit}
     */
    public function show(Request $request, int $unitId)
    {
        $landlord = $request->user();

        $unit = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
        ->with(['property:id,name,address', 'tenancies' => function ($query) {
            $query->select('id', 'unit_id', 'tenant_id', 'status', 'move_in_date', 'move_out_date')
                  ->with('tenant:id,full_name,email');
        }])
        ->findOrFail($unitId);

        return response()->json([
            'id' => $unit->id,
            'unit_code' => $unit->unit_code,
            'unit_name' => $unit->unit_name,
            'status' => $unit->status,
            'created_at' => $unit->created_at->format('Y-m-d H:i'),
            'property' => [
                'id' => $unit->property->id,
                'name' => $unit->property->name,
                'address' => $unit->property->address,
            ],
            'tenancies' => $unit->tenancies->map(function ($tenancy) {
                return [
                    'id' => $tenancy->id,
                    'status' => $tenancy->status,
                    'start_date' => $tenancy->move_in_date,
                    'end_date' => $tenancy->move_out_date,
                    'tenant' => $tenancy->tenant,
                ];
            }),
        ]);
    }

    /**
     * Create a new unit.
     * POST /api/v1/landlord/units
     */
    public function store(Request $request)
    {
        $landlord = $request->user();

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'unit_code' => 'required|string|max:50|unique:units',
            'unit_name' => 'required|string|max:100',
        ]);

        // Verify property belongs to landlord
        $property = Property::where('owner_id', $landlord->id)
            ->findOrFail($validated['property_id']);

        $unit = Unit::create([
            'property_id' => $property->id,
            'unit_code' => $validated['unit_code'],
            'unit_name' => $validated['unit_name'],
            'status' => 'available',
        ]);

        $property->increment('total_units');

        return response()->json([
            'message' => 'Unit created successfully',
            'unit' => [
                'id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'unit_name' => $unit->unit_name,
                'status' => $unit->status,
                'property_id' => $unit->property_id,
                'created_at' => $unit->created_at,
            ],
        ], 201);
    }

    /**
     * Update a unit.
     * PUT /api/v1/landlord/units/{unit}
     */
    public function update(Request $request, int $unitId)
    {
        $landlord = $request->user();

        $unit = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })->findOrFail($unitId);

        $validated = $request->validate([
            'unit_code' => 'sometimes|string|max:50|unique:units,unit_code,' . $unitId,
            'unit_name' => 'sometimes|string|max:100',
            'status' => 'sometimes|in:available,occupied,maintenance',
        ]);

        $unit->update($validated);

        return response()->json([
            'message' => 'Unit updated successfully',
            'unit' => [
                'id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'unit_name' => $unit->unit_name,
                'status' => $unit->status,
                'updated_at' => $unit->updated_at,
            ],
        ]);
    }

    /**
     * Delete a unit.
     * DELETE /api/v1/landlord/units/{unit}
     */
    public function destroy(Request $request, int $unitId)
    {
        $landlord = $request->user();

        $unit = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })->findOrFail($unitId);

        // Check if unit has active tenancies
        if ($unit->tenancies()->where('status', 'active')->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete unit with active tenancies.',
            ], 422);
        }

        $property = $unit->property;
        $unit->delete();
        
        // Decrement total_units on property
        $property->decrement('total_units');

        return response()->json([
            'message' => 'Unit deleted successfully',
        ]);
    }
}
