<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\UnitResource;
use App\Models\Property;
use App\Models\Unit;
use App\Services\Landlord\UnitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LandlordUnitController extends Controller
{
    public function __construct(protected UnitService $service)
    {
        $this->authorizeResource(Unit::class, 'unit');
    }

    // ... (create and store methods remain same as they are already simple enough)

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

        $unit = $this->service->createUnit($landlord, $request->validated());

        return redirect()
            ->route('landlord.properties.units', $unit->property_id)
            ->with('success', 'Unit created successfully!');
    }

    public function index(Request $request)
    {
        $data = $this->service->getUnitList($request->user(), $request);

        return Inertia::render('landlord/units/index', [
            'units' => UnitResource::collection($data['units']),
            'properties' => PropertyResource::collection($data['properties']),
            'selectedProperty' => $data['selectedProperty'],
            'metrics' => $data['metrics'],
            'propertyMetrics' => $data['propertyMetrics'],
            'filters' => [
                'property' => $data['selectedProperty'],
            ],
        ]);
    }

    public function byProperty(Request $request, Property $property)
    {
        $this->authorize('view', $property);

        $property->load(['units' => function ($query) {
            $query->orderBy('unit_code');
        }]);

        return Inertia::render('landlord/properties/units', [
            'property' => new PropertyResource($property),
            'units' => UnitResource::collection($property->units),
        ]);
    }

    public function show(Unit $unit)
    {
        $unit->load(['property', 'tenancies.tenant']);

        return Inertia::render('landlord/units/show', [
            'unit' => new UnitResource($unit),
        ]);
    }
}
