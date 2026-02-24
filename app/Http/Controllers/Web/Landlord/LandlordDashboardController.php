<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StoreTenantRequest;
use App\Models\Property;
use App\Models\Tenancy;

class LandlordDashboardController extends Controller
{
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get all properties owned by this landlord with unit and tenancy counts
        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units', 'tenancies as active_tenancies_count' => function ($query) {
                $query->where('status', 'active');
            }])
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->name,
                    'address' => $property->address,
                    'units_count' => $property->units_count,
                    'active_tenants_count' => $property->active_tenancies_count,
                ];
            });

        // Calculate summary statistics
        $totalProperties = $properties->count();
        $totalUnits = $properties->sum('units_count');
        $totalActiveTenants = $properties->sum('active_tenants_count');

        // Calculate monthly revenue from active tenancies
        $monthlyRevenue = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->where('status', 'active')
            ->sum('monthly_rent');

        return Inertia::render('landlord/dashboard', [
            'properties' => $properties,
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('landlord/tenants/create');
    }

    public function store(StoreTenantRequest $request)
    {
        $tenant = Tenant::create($request->validated());
        
        return redirect()
            ->route('landlord.dashboard')
            ->with('success', 'Tenant created successfully!');
    }
}