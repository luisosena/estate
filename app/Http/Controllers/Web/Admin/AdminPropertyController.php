<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\User;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\LandlordResource;
use App\Http\Requests\Admin\PropertyRequest;

class AdminPropertyController extends Controller
{
    /**
     * Display a listing of properties.
     */
    public function __construct()
    {
        $this->authorizeResource(Property::class, 'property');
    }
 
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Property::with(['landlord']);

        // Search functionality
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('address', 'like', '%' . $request->search . '%')
                  ->orWhere('city', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->status && $request->status !== 'all') {
            $query->where('properties.status', $request->status);
        }

        // Filter by landlord
        if ($request->owner_id && $request->owner_id !== 'all') {
            $query->where('owner_id', $request->owner_id);
        }

        $properties = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        // Get landlords for the filter
        $landlords = User::where('role', 'landlord')->orderBy('name')->get();

        return Inertia::render('admin/properties/index', [
            'properties' => PropertyResource::collection($properties),
            'landlords' => LandlordResource::collection($landlords),
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'owner_id' => $request->owner_id,
            ],
        ]);
    }

    /**
     * Show the form for creating a new property.
     */
    public function create()
    {
        $user = request()->user();

        $landlords = User::where('role', 'landlord')->orderBy('name')->get();

        return Inertia::render('admin/properties/create', [
            'landlords' => LandlordResource::collection($landlords),
        ]);
    }

    /**
     * Store a newly created property.
     */
    public function store(PropertyRequest $request)
    {
        $validated = $request->validated();

        $property = Property::create($validated);

        return redirect()
            ->route('admin.properties.index')
            ->with('success', 'Property created successfully.');
    }

    /**
     * Display the specified property.
     */
    public function show(Property $property)
    {
        $property->load(['landlord', 'units', 'units.tenancies.tenant']);

        return Inertia::render('admin/properties/show', [
            'property' => new PropertyResource($property),
        ]);
    }

    /**
     * Show the form for editing the specified property.
     */
    public function edit(Property $property)
    {
        $property->load(['landlord']);
        $landlords = User::where('role', 'landlord')->orderBy('name')->get();

        return Inertia::render('admin/properties/edit', [
            'property' => new PropertyResource($property),
            'landlords' => LandlordResource::collection($landlords),
        ]);
    }

    /**
     * Update the specified property.
     */
    public function update(PropertyRequest $request, Property $property)
    {
        $validated = $request->validated();

        $property->update($validated);

        return redirect()
            ->route('admin.properties.index')
            ->with('success', 'Property updated successfully.');
    }

    /**
     * Remove the specified property.
     */
    public function destroy(Property $property)
    {
        // Check if property has units
        if ($property->units()->exists()) {
            return redirect()
                ->route('admin.properties.index')
                ->with('error', 'Cannot delete property with existing units.');
        }

        $property->delete();

        return redirect()
            ->route('admin.properties.index')
            ->with('success', 'Property deleted successfully.');
    }

    /**
     * Get property statistics.
     */
    public function stats()
    {
        $stats = [
            'total_properties' => Property::count(),
            'active_properties' => Property::where('properties.status', 'active')->count(),
            'inactive_properties' => Property::where('properties.status', 'inactive')->count(),
            'maintenance_properties' => Property::where('properties.status', 'maintenance')->count(),
            'total_units' => Property::sum('total_units'),
            'properties_by_type' => Property::selectRaw('property_type, count(*) as count')
                ->groupBy('property_type')
                ->get(),
        ];

        return response()->json($stats);
    }
}
