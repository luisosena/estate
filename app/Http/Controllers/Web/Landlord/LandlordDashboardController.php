<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\Tenancy;

class LandlordDashboardController extends Controller
{
    public function index(Request $request)
    {
        $landlord = $request->user();

        // Get all properties owned by this landlord with unit and tenancy counts
        $properties = Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->with(['tenancies' => function ($query) {
                $query->where('tenancies.status', '=', 'active');
            }])
            ->get();

        // Calculate summary statistics
        $totalProperties = $properties->count();
        $totalUnits = $properties->sum('units_count');
        $totalActiveTenants = $properties->sum(function ($property) {
            return $property->tenancies->count();
        });

        // Format properties for frontend
        $formattedProperties = $properties->map(function ($property) {
            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'units_count' => $property->units_count,
                'active_tenants_count' => $property->tenancies->count(),
            ];
        });

        // Calculate monthly revenue from active tenancies
        $monthlyRevenue = Tenancy::whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })
            ->where('status', 'active')
            ->sum('monthly_rent');

        // Get unread notifications count
        $unreadNotificationsCount = $landlord->unreadNotifications()->count();

        return Inertia::render('landlord/dashboard', [
            'properties' => $formattedProperties,
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'monthly_revenue' => $monthlyRevenue,
            ],
            'unreadNotificationsCount' => $unreadNotificationsCount,
        ]);
    }

}