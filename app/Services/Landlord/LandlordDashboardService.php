<?php

namespace App\Services\Landlord;

use App\Http\Resources\PropertyResource;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\User;

class LandlordDashboardService
{
    public function __construct(
        protected \App\Services\RentBillService $rentBillService
    ) {}

    /**
     * Get the consolidated dashboard data for a landlord.
     */
    public function getDashboardData(User $landlord): array
    {
        // Get all properties owned by this landlord with unit and tenancy counts
        $properties = $landlord->properties()
            ->withCount(['units', 'tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }])
            ->get();

        // Calculate summary statistics
        $totalProperties = $properties->count();
        $totalUnits = $properties->sum('units_count');
        $totalActiveTenants = $properties->sum('active_tenants_count');

        // Calculate monthly revenue from active tenancies
        $monthlyRevenue = Tenancy::whereHas('unit.property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->where('status', 'active')
            ->sum('monthly_rent');

        // Get unread notifications count
        $unreadNotificationsCount = $landlord->unreadNotifications()->count();

        // Get rent bill statistics from specialized service
        $rentStats = $this->rentBillService->getRentStatistics($landlord);

        return [
            'properties' => PropertyResource::collection($properties),
            'stats' => [
                'total_tenants' => $totalActiveTenants,
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
