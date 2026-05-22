<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Landlord\PropertyStoreRequest;
use App\Http\Requests\Api\Landlord\PropertyUpdateRequest;
use App\Http\Resources\PropertyResource;
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
        $this->authorize('viewAny', Property::class);

        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

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

        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return PropertyResource::collection($properties)
            ->additional([
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
        $property = Property::where('id', $propertyId)
            ->where('owner_id', $request->user()->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->firstOrFail();

        $this->authorize('view', $property);

        $property->active_tenants_count = $property->tenancies->count();
        $property->occupied_units = $property->tenancies->count();
        $property->vacant_units = $property->units_count - $property->tenancies->count();
        $property->occupancy_rate = $property->units_count > 0
            ? round(($property->tenancies->count() / $property->units_count) * 100, 1)
            : 0;

        return new PropertyResource($property);
    }

    /**
     * Create a new property.
     * POST /api/v1/landlord/properties
     */
    public function store(PropertyStoreRequest $request)
    {
        $this->authorize('create', Property::class);

        $landlord = $request->user();

        $validated = $request->validated();

        $property = Property::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'property_type' => $validated['property_type'] ?? null,
            'description' => $validated['description'] ?? null,
            'owner_id' => $landlord->id,
            'total_units' => 0,
        ]);

        return (new PropertyResource($property))
            ->additional(['message' => 'Property created successfully'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update a property.
     * PUT /api/v1/landlord/properties/{property}
     */
    public function update(Request $request, int $propertyId, PropertyUpdateRequest $requestUpdate)
    {
        $property = Property::where('owner_id', $request->user()->id)->findOrFail($propertyId);
        $this->authorize('update', $property);

        $validated = $requestUpdate->validated();

        $property->update($validated);

        return (new PropertyResource($property))
            ->additional(['message' => 'Property updated successfully']);
    }

    /**
     * Delete a property.
     * DELETE /api/v1/landlord/properties/{property}
     */
    public function destroy(Request $request, int $propertyId)
    {
        $property = Property::where('id', $propertyId)
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

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
