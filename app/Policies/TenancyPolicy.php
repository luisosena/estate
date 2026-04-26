<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Tenancy;
use App\Models\User;

class TenancyPolicy
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

    public function view(User $user, Tenancy $tenancy): bool
    {
        if ($user->role === Role::Landlord) {
            return $tenancy->unit->property->owner_id === $user->id;
        }

        if ($user->role === Role::Tenant) {
            return $user->tenant_id === $tenancy->tenant_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    public function update(User $user, Tenancy $tenancy): bool
    {
        return $tenancy->unit->property->owner_id === $user->id;
    }

    public function delete(User $user, Tenancy $tenancy): bool
    {
        return $tenancy->unit->property->owner_id === $user->id;
    }
}
