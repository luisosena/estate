<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * Get all properties for the landlord.
     * GET /api/v1/landlord/properties
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        // Calculate stats using efficient COUNT queries (not loading all records)
        $totalProperties = Property::where('owner_id', $landlord->id)->count();
        $totalUnits = Property::where('owner_id', $landlord->id)->sum('total_units');
        $totalOccupiedUnits = Property::where('owner_id', $landlord->id)
            ->withCount(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->get()
            ->sum('tenancies_count');
        $totalAvailableUnits = $totalUnits - $totalOccupiedUnits;
        $overallOccupancyRate = $totalUnits > 0
            ? round(($totalOccupiedUnits / $totalUnits) * 100, 1)
            : 0;

        // Use database-level pagination with proper eager loading
        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Format properties
        $formattedProperties = $properties->getCollection()->map(function ($property) {
            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'total_units' => $property->total_units,
                'units_count' => $property->units_count,
                'active_tenants_count' => $property->tenancies->count(),
                'occupied_units' => $property->tenancies->count(),
                'vacant_units' => $property->units_count > 0
                    ? $property->units_count - $property->tenancies->count()
                    : 0,
                'occupancy_rate' => $property->units_count > 0
                    ? round(($property->tenancies->count() / $property->units_count) * 100, 1)
                    : 0,
                'created_at' => $property->created_at,
            ];
        });

        return response()->json([
            'data' => $formattedProperties,
            'meta' => [
                'current_page' => $properties->currentPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
                'total_pages' => $properties->lastPage(),
            ],
            'stats' => [
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'total_occupied_units' => $totalOccupiedUnits,
                'total_available_units' => $totalAvailableUnits,
                'overall_occupancy_rate' => $overallOccupancyRate,
            ],
        ]);
    }

    /**
     * Get a single property.
     * GET /api/v1/landlord/properties/{property}
     */
    public function show(Request $request, int $propertyId)
    {
        $landlord = $request->user();

        $property = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->findOrFail($propertyId);

        return response()->json([
            'data' => [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'total_units' => $property->total_units,
                'units_count' => $property->units_count,
                'active_tenants_count' => $property->tenancies->count(),
                'occupied_units' => $property->tenancies->count(),
                'vacant_units' => $property->units_count - $property->tenancies->count(),
                'occupancy_rate' => $property->units_count > 0
                    ? round(($property->tenancies->count() / $property->units_count) * 100, 1)
                    : 0,
                'created_at' => $property->created_at,
            ],
        ]);
    }

    /**
     * Create a new property.
     * POST /api/v1/landlord/properties
     */
    public function store(Request $request)
    {
        $landlord = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'property_type' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $property = Property::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'property_type' => $validated['property_type'] ?? null,
            'description' => $validated['description'] ?? null,
            'owner_id' => $landlord->id,
            'total_units' => 0,
        ]);

        return response()->json([
            'message' => 'Property created successfully',
            'data' => [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'total_units' => $property->total_units,
                'created_at' => $property->created_at,
            ],
        ], 201);
    }

    /**
     * Update a property.
     * PUT /api/v1/landlord/properties/{property}
     */
    public function update(Request $request, int $propertyId)
    {
        $landlord = $request->user();

        $property = Property::where('owner_id', $landlord->id)
            ->findOrFail($propertyId);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:500',
            'property_type' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $property->update($validated);

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'total_units' => $property->total_units,
                'updated_at' => $property->updated_at,
            ],
        ]);
    }

    /**
     * Delete a property.
     * DELETE /api/v1/landlord/properties/{property}
     */
    public function destroy(Request $request, int $propertyId)
    {
        $landlord = $request->user();

        $property = Property::where('owner_id', $landlord->id)
            ->findOrFail($propertyId);

        // Check if property has units
        if ($property->units()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete property with units. Please remove all units first.',
            ], 422);
        }

        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully',
        ]);
    }
}
