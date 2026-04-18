<?php

namespace App\Services\Landlord;

use App\Http\Resources\PropertyResource;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\User;

class LandlordDashboardService
{
    /**
     * Get the consolidated dashboard data for a landlord.
     */
    public function getDashboardData(User $landlord): array
    {
        // Get all properties owned by this landlord with unit and tenancy counts
        $properties = $landlord->properties()
            ->withCount(['units', 'tenancies as active_tenants_count' => function ($query) {
                $query->where('status', 'active');
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

        // Get rent bill statistics
        $rentStats = $this->getRentStatistics($landlord);

        return [
            'properties' => PropertyResource::collection($properties),
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'monthly_revenue' => (float) $monthlyRevenue,
                'pending_rent_bills' => (int) ($rentStats->pending_count ?? 0),
                'overdue_rent_bills' => (int) ($rentStats->overdue_count ?? 0),
                'total_rent_outstanding' => (float) ($rentStats->total_outstanding ?? 0),
            ],
            'unreadNotificationsCount' => $unreadNotificationsCount,
        ];
    }

    /**
     * Calculate optimized rent statistics using raw aggregation.
     */
    protected function getRentStatistics(User $landlord)
    {
        return RentBill::whereHas('tenancy.unit.property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->selectRaw("
                SUM(CASE WHEN status = 'pending' AND (due_date >= CURDATE() OR due_date IS NULL) THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'overdue' OR (status IN ('pending', 'partial') AND due_date < CURDATE()) THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') THEN amount_due - amount_paid ELSE 0 END) as total_outstanding
            ")
            ->first();
    }
}
