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
            return $utilityBill->tenancyUtility->tenancy->unit->property->owner_id === $user->id;
        }

        if ($user->role === Role::Tenant) {
            return $user->tenant_id === $utilityBill->tenancyUtility->tenancy->tenant_id;
        }

        return false;
    }

    public function waive(User $user, UtilityBill $utilityBill): bool
    {
        return $utilityBill->tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }
}
