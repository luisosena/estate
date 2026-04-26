<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\TenancyUtility;
use App\Models\User;

class TenancyUtilityPolicy
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
        return $user->role === Role::Landlord;
    }

    public function view(User $user, TenancyUtility $tenancyUtility): bool
    {
        return $tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    public function update(User $user, TenancyUtility $tenancyUtility): bool
    {
        return $tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }

    public function delete(User $user, TenancyUtility $tenancyUtility): bool
    {
        return $tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }
}
