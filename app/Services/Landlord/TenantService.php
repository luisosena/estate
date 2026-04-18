<?php

namespace App\Services\Landlord;

use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

class TenantService
{
    /**
     * Get tenant listing with statistics and filters.
     */
    public function getTenantList(User $landlord, Request $request): array
    {
        $selectedPropertyId = $request->get('property');
        $search = $request->get('search');

        // 1. Build Tenant Query
        $query = Tenant::query()
            ->whereHas('tenancies.unit.property', function ($q) use ($landlord, $selectedPropertyId) {
                $q->where('owner_id', $landlord->id);
                if ($selectedPropertyId && $selectedPropertyId !== 'all') {
                    $q->where('id', $selectedPropertyId);
                }
            })
            ->with(['tenancies' => function ($q) {
                $q->where('status', 'active')->with(['unit.property']);
            }]);

        // Search logic
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('tenant_code', 'like', "%{$search}%");
            });
        }

        $tenants = $query->paginate(15);

        // 2. Statistics
        $stats = $this->calculateStats($landlord);

        return [
            'tenants' => $tenants,
            'stats' => $stats,
            'filters' => [
                'property' => $selectedPropertyId,
                'search' => $search,
            ],
        ];
    }

    /**
     * Calculate global tenant statistics for a landlord.
     */
    protected function calculateStats(User $landlord): array
    {
        $totalUnits = $landlord->properties()->sum('total_units');
        
        $occupiedUnits = Tenancy::where('status', 'active')
            ->whereHas('unit.property', fn ($q) => $q->where('owner_id', $landlord->id))
            ->count();

        $propertiesCount = $landlord->properties()->count();

        return [
            'total_tenants' => $occupiedUnits,
            'total_properties' => $propertiesCount,
            'total_units' => $totalUnits,
            'occupied_units' => $occupiedUnits,
        ];
    }

    /**
     * Change a tenant's unit.
     */
    public function changeUnit(Tenancy $tenancy, int $newUnitId): void
    {
        \DB::transaction(function () use ($tenancy, $newUnitId) {
            // 1. Mark old unit as available
            $tenancy->unit->update(['status' => 'available']);

            // 2. Update tenancy with new unit
            $tenancy->update(['unit_id' => $newUnitId]);

            // 3. Mark new unit as occupied
            \App\Models\Unit::where('id', $newUnitId)->update(['status' => 'occupied']);
        });
    }
}
