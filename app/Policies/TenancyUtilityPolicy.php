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
        return in_array($user->role, [Role::Landlord, Role::Tenant]);
    }

    public function view(User $user, TenancyUtility $tenancyUtility): bool
    {
        if ($user->role === Role::Landlord) {
            return TenancyUtility::where('id', $tenancyUtility->id)
                ->whereHas('tenancy.unit.property', fn ($query) => $query->where('owner_id', $user->id))
                ->exists();
        }

        if ($user->role === Role::Tenant) {
            return TenancyUtility::where('id', $tenancyUtility->id)
                ->whereHas('tenancy', fn ($query) => $query->where('tenant_id', $user->tenant_id))
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    public function update(User $user, TenancyUtility $tenancyUtility): bool
    {
        if ($user->role === Role::Landlord) {
            return $this->view($user, $tenancyUtility);
        }

        return false;
    }

    public function delete(User $user, TenancyUtility $tenancyUtility): bool
    {
        return $this->update($user, $tenancyUtility);
    }
}
