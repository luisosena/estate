<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Models\Property;
use App\Models\Unit;
use App\Http\Resources\UnitResource;
use App\Http\Resources\PropertyResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LandlordUnitController extends Controller
{
    public function create(Request $request)
    {
        $landlord = $request->user();
        
        $properties = Property::where('owner_id', $landlord->id)
            ->select('id', 'name', 'address')
            ->get();

        return Inertia::render('landlord/units/create', [
            'properties' => PropertyResource::collection($properties),
        ]);
    }

    public function store(StoreUnitRequest $request)
    {
        $landlord = $request->user();
        
        return DB::transaction(function () use ($request, $landlord) {
            $property = Property::where('owner_id', $landlord->id)
                ->findOrFail($request->property_id);

            $unit = Unit::create([
                'property_id' => $property->id,
                'unit_code' => $request->unit_code,
                'unit_name' => $request->unit_name,
                'status' => 'available',
            ]);

            $property->increment('total_units');

            return redirect()
                ->route('landlord.properties.units', $property->id)
                ->with('success', 'Unit created successfully!');
        });
    }

    public function index(Request $request)
    {
        $landlord = $request->user();
        
        // Get all properties for categorization
        $properties = Property::where('owner_id', $landlord->id)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        
        // Get selected property filter
        $selectedPropertyId = $request->get('property');
        
        $query = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
        ->with('property:id,name');
        
        // Apply property filter if selected
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $query->where('property_id', $selectedPropertyId);
        }
        
        $units = $query->orderBy('property_id')
            ->orderBy('unit_code')
            ->paginate(15);

        // Calculate breakdown metrics (Global for the landlord)
        $metricsQuery = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        });

        $totalUnits = (clone $metricsQuery)->count();
        $availableUnits = (clone $metricsQuery)->where('status', 'available')->count();
        $occupiedUnits = (clone $metricsQuery)->where('status', 'occupied')->count();
        $occupancyRate = $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0;

        // If a specific property is selected, calculate property-specific metrics
        $propertyMetrics = null;
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $propMetricsQuery = Unit::where('property_id', $selectedPropertyId);
            $propTotal = (clone $propMetricsQuery)->count();
            $propOccupied = (clone $propMetricsQuery)->where('status', 'occupied')->count();
            
            $propertyMetrics = [
                'total_units' => $propTotal,
                'available_units' => (clone $propMetricsQuery)->where('status', 'available')->count(),
                'occupied_units' => $propOccupied,
                'occupancy_rate' => $propTotal > 0 ? round(($propOccupied / $propTotal) * 100, 1) : 0,
                'total_properties' => 1,
            ];
        }

        return Inertia::render('landlord/units/index', [
            'units' => UnitResource::collection($units),
            'properties' => PropertyResource::collection($properties),
            'selectedProperty' => $selectedPropertyId ?: 'all',
            'metrics' => [
                'total_units' => $totalUnits,
                'available_units' => $availableUnits,
                'occupied_units' => $occupiedUnits,
                'occupancy_rate' => $occupancyRate,
                'total_properties' => $properties->count(),
            ],
            'propertyMetrics' => $propertyMetrics,
            'filters' => [
                'property' => $selectedPropertyId,
            ],
        ]);
    }

    public function byProperty(Request $request, $propertyId)
    {
        $landlord = $request->user();
        
        $property = Property::where('owner_id', $landlord->id)
            ->with(['units' => function ($query) {
                $query->orderBy('unit_code');
            }])
            ->findOrFail($propertyId);

        return Inertia::render('landlord/properties/units', [
            'property' => new PropertyResource($property),
            'units' => UnitResource::collection($property->units),
        ]);
    }

    public function show(Request $request, $unitId)
    {
        $landlord = $request->user();
        
        $unit = Unit::whereHas('property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
        ->with(['property', 'tenancies.tenant'])
        ->findOrFail($unitId);

        return Inertia::render('landlord/units/show', [
            'unit' => new UnitResource($unit),
        ]);
    }
}
