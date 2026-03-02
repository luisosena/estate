<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Models\Property;
use App\Models\Unit;
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
            'properties' => $properties,
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
        ->with('property:id,name')
        ->select('id', 'unit_code', 'unit_name', 'status', 'property_id', 'created_at');
        
        // Apply property filter if selected
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $query->where('property_id', $selectedPropertyId);
        }
        
        $units = $query->orderBy('property_id')
            ->orderBy('unit_code')
            ->get()
            ->map(function ($unit) {
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

        // Calculate breakdown metrics
        $totalUnits = $units->count();
        $availableUnits = $units->filter(function ($unit) {
            return $unit['status'] === 'available';
        })->count();
        $occupiedUnits = $units->filter(function ($unit) {
            return $unit['status'] === 'occupied';
        })->count();
        $occupancyRate = $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0;

        // If a specific property is selected, calculate property-specific metrics
        $propertyMetrics = null;
        if ($selectedPropertyId && $selectedPropertyId !== 'all') {
            $propertyUnits = $units->filter(function ($unit) use ($selectedPropertyId) {
                return $unit['property']['id'] == $selectedPropertyId;
            });
            $propertyAvailableUnits = $propertyUnits->filter(function ($unit) {
                return $unit['status'] === 'available';
            })->count();
            $propertyOccupiedUnits = $propertyUnits->filter(function ($unit) {
                return $unit['status'] === 'occupied';
            })->count();
            
            $propertyMetrics = [
                'total_units' => $propertyUnits->count(),
                'available_units' => $propertyAvailableUnits,
                'occupied_units' => $propertyOccupiedUnits,
                'occupancy_rate' => $propertyUnits->count() > 0 
                    ? round(($propertyOccupiedUnits / $propertyUnits->count()) * 100, 1) 
                    : 0,
            ];
        }

        return Inertia::render('landlord/units/index', [
            'units' => $units,
            'properties' => $properties,
            'selectedProperty' => $selectedPropertyId ?: 'all',
            'metrics' => [
                'total_units' => $totalUnits,
                'available_units' => $availableUnits,
                'occupied_units' => $occupiedUnits,
                'occupancy_rate' => $occupancyRate,
                'total_properties' => $properties->count(),
            ],
            'propertyMetrics' => $propertyMetrics,
        ]);
    }

    public function byProperty(Request $request, $propertyId)
    {
        $landlord = $request->user();
        
        $property = Property::where('owner_id', $landlord->id)
            ->with(['units' => function ($query) {
                $query->select('id', 'unit_code', 'unit_name', 'status', 'created_at')
                      ->orderBy('unit_code');
            }])
            ->findOrFail($propertyId);

        $units = $property->units->map(function ($unit) {
            return [
                'id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'unit_name' => $unit->unit_name,
                'status' => $unit->status,
                'created_at' => $unit->created_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('landlord/properties/units', [
            'property' => [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'total_units' => $property->total_units,
            ],
            'units' => $units,
        ]);
    }

    public function show(Request $request, $unitId)
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

        return Inertia::render('landlord/units/show', [
            'unit' => [
                'id' => $unit->id,
                'unit_code' => $unit->unit_code,
                'unit_name' => $unit->unit_name,
                'status' => $unit->status,
                'created_at' => $unit->created_at->format('Y-m-d H:i'),
                'property' => $unit->property,
                'tenancies' => $unit->tenancies->map(function ($tenancy) {
                    return [
                        'id' => $tenancy->id,
                        'status' => $tenancy->status,
                        'start_date' => $tenancy->move_in_date,
                        'end_date' => $tenancy->move_out_date,
                        'tenant' => $tenancy->tenant,
                    ];
                }),
            ],
        ]);
    }
}
