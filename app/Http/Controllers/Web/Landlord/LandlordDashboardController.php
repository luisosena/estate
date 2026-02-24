<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;

class LandlordDashboardController extends Controller
{
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get all properties owned by this landlord with unit and tenancy counts
        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units', 'tenancies as active_tenancies_count' => function ($query) {
                $query->where('tenancies.status', 'active');
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


        return Inertia::render('landlord/dashboard', [
            'properties' => $properties,
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
            ],
        ]);
    }

}