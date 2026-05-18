<?php

namespace App\Services\Landlord;

use App\Http\Resources\PropertyResource;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;

class LandlordDashboardService
{
    public function __construct(
        protected \App\Services\RentBillService $rentBillService
    ) {}

    public function getDashboardData(User $landlord): array
    {
        $properties = $landlord->properties()
            ->withCount(['units'])
            ->withCount(['tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }])
            ->get();

        $totalProperties = $properties->count();
        $totalUnits = $properties->sum('units_count');
        $totalActiveTenants = $properties->sum('active_tenants_count');

        $occupiedUnits = Unit::whereHas('property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->whereHas('tenancies', fn ($query) => $query->where('status', 'active'))
            ->distinct('units.id')
            ->count();

        $monthlyRevenue = Tenancy::whereHas('unit.property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->where('status', 'active')
            ->sum('monthly_rent');

        $unreadNotificationsCount = $landlord->unreadNotifications()->count();

        $rentStats = $this->rentBillService->getRentStatistics($landlord);

        return [
            'properties' => PropertyResource::collection($properties),
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'occupied_units' => $occupiedUnits,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'monthly_revenue' => (float) $monthlyRevenue,
                'pending_rent_bills' => (int) ($rentStats['pending'] ?? 0),
                'overdue_rent_bills' => (int) ($rentStats['overdue'] ?? 0),
                'total_rent_outstanding' => (float) ($rentStats['total_outstanding'] ?? 0),
            ],
            'unreadNotificationsCount' => $unreadNotificationsCount,
        ];
    }
}
