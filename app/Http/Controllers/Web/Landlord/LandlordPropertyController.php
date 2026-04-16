<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Http\Resources\PropertyResource;

class LandlordPropertyController extends Controller
{
    /**
     * Display a listing of properties.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Base query with counts
        $query = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->withCount(['tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }]);

        // Standardize output with PropertyResource and Pagination
        $properties = $query->orderBy('name')
            ->paginate(12); // Using 12 for property grids (divisible by 2, 3, 4)

        // Calculate summary statistics (Global stats shouldn't be paginated)
        $statsQuery = Property::where('owner_id', $landlord->id);
        
        $totalProperties = (clone $statsQuery)->count();
        $totalUnits = (clone $statsQuery)->sum('total_units');
        
        // Complex sum for occupied units across all properties
        $totalOccupiedUnits = \App\Models\Tenancy::whereHas('unit.property', function ($q) use ($landlord) {
            $q->where('owner_id', $landlord->id);
        })->where('tenancies.status', 'active')->count();

        $totalAvailableUnits = max(0, $totalUnits - $totalOccupiedUnits);
        $overallOccupancyRate = $totalUnits > 0 
            ? round(($totalOccupiedUnits / $totalUnits) * 100, 1) 
            : 0;

        return Inertia::render('landlord/properties/index', [
            'properties' => PropertyResource::collection($properties),
            'stats' => [
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'total_occupied_units' => $totalOccupiedUnits,
                'total_available_units' => $totalAvailableUnits,
                'overall_occupancy_rate' => $overallOccupancyRate,
            ],
            'filters' => [
                'search' => $request->get('search'),
            ],
        ]);
    }
}
