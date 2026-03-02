<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;

class LandlordPropertyController extends Controller
{
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get all properties owned by this landlord with unit counts and tenant counts
        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->get()
            ->map(function ($property) {
                return [
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
                ];
            });

        // Calculate summary statistics
        $totalProperties = $properties->count();
        $totalUnits = $properties->sum('units_count');
        $totalOccupiedUnits = $properties->sum('occupied_units');
        $totalAvailableUnits = $properties->sum('available_units');
        $overallOccupancyRate = $totalUnits > 0 
            ? round(($totalOccupiedUnits / $totalUnits) * 100, 1) 
            : 0;

        return Inertia::render('landlord/properties/index', [
            'properties' => $properties,
            'stats' => [
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'total_occupied_units' => $totalOccupiedUnits,
                'total_available_units' => $totalAvailableUnits,
                'overall_occupancy_rate' => $overallOccupancyRate,
            ],
        ]);
    }
}
