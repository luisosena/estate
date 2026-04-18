<?php

namespace App\Services\Landlord;

use App\Models\Tenancy;
use App\Models\User;

class PropertyService
{
    /**
     * Get property listing with statistics.
     */
    public function getPropertyList(User $landlord, int $perPage = 12): array
    {
        // 1. Paginated properties with counts
        $properties = $landlord->properties()
            ->withCount(['units'])
            ->withCount(['tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }])
            ->orderBy('name')
            ->paginate($perPage);

        // 2. Global statistics
        $stats = $this->calculateStats($landlord);

        return [
            'properties' => $properties,
            'stats' => $stats,
        ];
    }

    /**
     * Calculate global property statistics for the landlord.
     */
    protected function calculateStats(User $landlord): array
    {
        $totalUnits = $landlord->properties()->sum('total_units');

        $totalOccupiedUnits = Tenancy::whereHas('unit.property', function ($q) use ($landlord) {
            $q->where('owner_id', $landlord->id);
        })->where('status', 'active')->count();

        $totalAvailableUnits = max(0, $totalUnits - $totalOccupiedUnits);

        $overallOccupancyRate = $totalUnits > 0
            ? round(($totalOccupiedUnits / $totalUnits) * 100, 1)
            : 0;

        return [
            'total_properties' => $landlord->properties()->count(),
            'total_units' => $totalUnits,
            'total_occupied_units' => $totalOccupiedUnits,
            'total_available_units' => $totalAvailableUnits,
            'overall_occupancy_rate' => $overallOccupancyRate,
        ];
    }
}
