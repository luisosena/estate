<?php

namespace App\Services;

use App\Models\Utility;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

class UtilityService
{
    public function getTenantUtilities(Tenant $tenant): Collection
    {
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['utilities'])
            ->first();

        return $activeTenancy?->utilities ?? collect();
    }

    public function createUtility(array $utilityData): Utility
    {
        return Utility::create($utilityData);
    }

    public function updateUtility(Utility $utility, array $utilityData): Utility
    {
        $utility->update($utilityData);
        return $utility;
    }

    public function deleteUtility(Utility $utility): bool
    {
        return $utility->delete();
    }
}
