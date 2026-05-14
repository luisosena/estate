<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;
use App\Models\UtilityBill;

class UtilityBillPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === Role::Admin) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, [Role::Landlord, Role::Tenant]);
    }

    public function view(User $user, UtilityBill $utilityBill): bool
    {
        if ($user->role === Role::Landlord) {
            return UtilityBill::where('id', $utilityBill->id)
                ->whereHas('tenancyUtility.tenancy.unit.property', fn ($query) => $query->where('owner_id', $user->id))
                ->exists();
        }

        if ($user->role === Role::Tenant) {
            return UtilityBill::where('id', $utilityBill->id)
                ->whereHas('tenancyUtility.tenancy', fn ($query) => $query->where('tenant_id', $user->tenant_id))
                ->exists();
        }

        return false;
    }

    public function waive(User $user, UtilityBill $utilityBill): bool
    {
        if ($user->role === Role::Landlord) {
            return UtilityBill::where('id', $utilityBill->id)
                ->whereHas('tenancyUtility.tenancy.unit.property', fn ($query) => $query->where('owner_id', $user->id))
                ->exists();
        }

        return false;
    }
}
