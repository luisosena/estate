<?php

namespace App\Services\Landlord;

use App\Http\Resources\PropertyResource;
use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use App\Services\RentBillService;
use Illuminate\Support\Carbon;

class LandlordDashboardService
{
    public function __construct(
        protected RentBillService $rentBillService
    ) {}

    /**
     * @return array<string, mixed>
     */
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

        $currentOccupancy = $totalUnits > 0
            ? (int) round(($occupiedUnits / $totalUnits) * 100)
            : 0;

        return [
            'properties' => PropertyResource::collection($properties),
            'stats' => [
                'total_tenants' => $totalActiveTenants,
                'occupied_units' => $occupiedUnits,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'occupancy_rate' => $currentOccupancy,
                'monthly_revenue' => (float) $monthlyRevenue,
                'pending_rent_bills' => (int) ($rentStats['pending'] ?? 0),
                'overdue_rent_bills' => (int) ($rentStats['overdue'] ?? 0),
                'total_rent_outstanding' => (float) ($rentStats['total_outstanding'] ?? 0),
            ],
            'trends' => $this->getTrends($landlord, [
                'total_tenants' => $totalActiveTenants,
                'total_properties' => $totalProperties,
                'total_units' => $totalUnits,
                'monthly_revenue' => (float) $monthlyRevenue,
                'occupancy_rate' => $currentOccupancy,
            ]),
            'unreadNotificationsCount' => $unreadNotificationsCount,
        ];
    }

    /**
     * Compute month-over-month deltas for headline KPIs by replaying the
     * counts as they would have looked at the end of the previous month.
     *
     * @param  array<string, int|float>  $current
     * @return array<string, array{current: int|float, previous: int|float, delta_pct: float, direction: string}>
     */
    protected function getTrends(User $landlord, array $current): array
    {
        $cutoff = Carbon::now()->subMonth()->endOfMonth();

        $previousActiveTenants = Tenancy::whereHas('unit.property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->where('status', 'active')
            ->where('created_at', '<=', $cutoff)
            ->count();

        $previousProperties = $landlord->properties()
            ->where('created_at', '<=', $cutoff)
            ->count();

        $previousUnits = Unit::whereHas('property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->where('created_at', '<=', $cutoff)
            ->count();

        $previousMonthlyRevenue = Tenancy::whereHas('unit.property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->where('status', 'active')
            ->where('created_at', '<=', $cutoff)
            ->sum('monthly_rent');

        $previousOccupied = Unit::whereHas('property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->whereHas('tenancies', fn ($query) => $query->where('status', 'active')->where('created_at', '<=', $cutoff))
            ->distinct('units.id')
            ->count();

        $previousOccupancy = $previousUnits > 0
            ? (int) round(($previousOccupied / $previousUnits) * 100)
            : 0;

        $previousRevenue = (float) Payment::whereHas('tenancy.unit.property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$cutoff->copy()->startOfMonth(), $cutoff])
            ->sum('amount');

        $currentRevenue = (float) Payment::whereHas('tenancy.unit.property', fn ($query) => $query->where('owner_id', $landlord->id))
            ->where('status', 'paid')
            ->whereBetween('paid_at', [Carbon::now()->startOfMonth(), Carbon::now()])
            ->sum('amount');

        $useRevenue = $currentRevenue > 0 || $previousRevenue > 0;

        return [
            'total_tenants' => $this->buildTrend(
                (int) $current['total_tenants'],
                (int) $previousActiveTenants,
            ),
            'total_properties' => $this->buildTrend(
                (int) $current['total_properties'],
                (int) $previousProperties,
            ),
            'total_units' => $this->buildTrend(
                (int) $current['total_units'],
                (int) $previousUnits,
            ),
            'occupancy_rate' => $this->buildTrend(
                (int) $current['occupancy_rate'],
                (int) $previousOccupancy,
            ),
            'monthly_revenue' => $this->buildTrend(
                $useRevenue ? (float) $currentRevenue : (float) $current['monthly_revenue'],
                $useRevenue ? (float) $previousRevenue : (float) $previousMonthlyRevenue,
            ),
        ];
    }

    /**
     * @return array{current: int|float, previous: int|float, delta_pct: float, direction: string}
     */
    protected function buildTrend(int|float $current, int|float $previous): array
    {
        $deltaPct = 0.0;

        if ($previous != 0) {
            $deltaPct = round((($current - $previous) / abs($previous)) * 100, 1);
        } elseif ($current > 0) {
            $deltaPct = 100.0;
        }

        $direction = match (true) {
            $deltaPct > 0.05 => 'up',
            $deltaPct < -0.05 => 'down',
            default => 'flat',
        };

        return [
            'current' => $current,
            'previous' => $previous,
            'delta_pct' => $deltaPct,
            'direction' => $direction,
        ];
    }
}
