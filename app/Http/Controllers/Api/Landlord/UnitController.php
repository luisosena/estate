<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Resources\UnitResource;
use App\Models\Property;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * Get all units for the landlord.
     * GET /api/v1/landlord/units
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Unit::class);

        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);
        $propertyId = $request->get('property_id');
        $status = $request->get('status');

        // Build base query for filtering
        $baseQuery = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        });

        if ($propertyId) {
            $baseQuery->where('property_id', $propertyId);
        }

        // Filter by status (available, occupied, vacant)
        if ($status) {
            $baseQuery->where('status', $status);
        }

        // Calculate stats using efficient COUNT queries (not loading all records)
        $totalUnits = (clone $baseQuery)->count();
        $availableUnits = (clone $baseQuery)->where('status', 'available')->count();
        $occupiedUnits = (clone $baseQuery)->where('status', 'occupied')->count();
        $occupancyRate = $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0;

        // Use database-level pagination
        $units = $baseQuery->with('property:id,name')
            ->orderBy('property_id')
            ->orderBy('unit_code')
            ->paginate($perPage, ['*'], 'page', $page);

        return UnitResource::collection($units)->additional([
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
        $unit = Unit::whereHas('property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->with(['property:id,name,address', 'tenancies' => function ($query) {
            $query->select('id', 'unit_id', 'tenant_id', 'status', 'move_in_date', 'move_out_date', 'monthly_rent', 'security_deposit')
                ->with('tenant:id,full_name,email');
        }])->findOrFail($unitId);

        $this->authorize('view', $unit);

        return new UnitResource($unit);
    }

    /**
     * Create a new unit.
     * POST /api/v1/landlord/units
     */
    public function store(Request $request)
    {
        $this->authorize('create', Unit::class);

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
            'data' => new UnitResource($unit),
        ], 201);
    }

    /**
     * Update a unit.
     * PUT /api/v1/landlord/units/{unit}
     */
    public function update(Request $request, int $unitId)
    {
        $unit = Unit::whereHas('property', function ($query) use ($request) {
            $query->where('owner_id', $request->user()->id);
        })->findOrFail($unitId);
        $this->authorize('update', $unit);

        $validated = $request->validate([
            'unit_code' => 'sometimes|string|max:50|unique:units,unit_code,'.$unitId,
            'unit_name' => 'sometimes|string|max:100',
            'status' => 'sometimes|in:available,occupied,maintenance',
        ]);

        $unit->update($validated);

        return response()->json([
            'message' => 'Unit updated successfully',
            'data' => new UnitResource($unit),
        ]);
    }

    /**
     * Delete a unit.
     * DELETE /api/v1/landlord/units/{unit}
     */
    public function destroy(Request $request, int $unitId)
    {
        $unit = Unit::where('id', $unitId)
            ->whereHas('property', function ($query) use ($request) {
                $query->where('owner_id', $request->user()->id);
            })
            ->firstOrFail();

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
