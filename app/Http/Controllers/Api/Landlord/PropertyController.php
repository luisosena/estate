<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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

        // Get base query with relationships
        $query = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }]);

        // Get all properties for stats calculation
        $allProperties = $query->get();
        
        // Calculate summary statistics
        $totalProperties = $allProperties->count();
        $totalUnits = $allProperties->sum('units_count');
        $totalOccupiedUnits = $allProperties->sum(function ($property) {
            return $property->tenancies->count();
        });
        $totalAvailableUnits = $totalUnits - $totalOccupiedUnits;
        $overallOccupancyRate = $totalUnits > 0 
            ? round(($totalOccupiedUnits / $totalUnits) * 100, 1) 
            : 0;

        // Format properties
        $formattedProperties = $allProperties->map(function ($property) {
            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'total_units' => $property->total_units,
                'units_count' => $property->units_count,
                'active_tenants_count' => $property->tenancies->count(),
                'occupied_units' => $property->tenancies->count(),
                'available_units' => $property->units_count > 0 
                    ? $property->units_count - $property->tenancies->count() 
                    : 0,
                'occupancy_rate' => $property->units_count > 0 
                    ? round(($property->tenancies->count() / $property->units_count) * 100, 1) 
                    : 0,
                'created_at' => $property->created_at,
            ];
        });

        // Use database-level pagination
        $totalItems = $formattedProperties->count();
        $totalPages = ceil($totalItems / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginatedProperties = $formattedProperties->slice($offset, $perPage)->values();

        return response()->json([
            'data' => $paginatedProperties,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
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
            'id' => $property->id,
            'name' => $property->name,
            'address' => $property->address,
            'total_units' => $property->total_units,
            'units_count' => $property->units_count,
            'active_tenants_count' => $property->tenancies->count(),
            'occupied_units' => $property->tenancies->count(),
            'available_units' => $property->units_count - $property->tenancies->count(),
            'occupancy_rate' => $property->units_count > 0 
                ? round(($property->tenancies->count() / $property->units_count) * 100, 1) 
                : 0,
            'created_at' => $property->created_at,
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
        ]);

        $property = Property::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'owner_id' => $landlord->id,
            'total_units' => 0,
        ]);

        return response()->json([
            'message' => 'Property created successfully',
            'property' => [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
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
        ]);

        $property->update($validated);

        return response()->json([
            'message' => 'Property updated successfully',
            'property' => [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
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
