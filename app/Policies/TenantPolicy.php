<?php

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;
use App\Enums\Role;

class TenantPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === Role::ADMIN) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->role === Role::LANDLORD;
    }

    public function view(User $user, Tenant $tenant): bool
    {
        // A landlord can view a tenant if they have a tenancy in the landlord's property
        return $tenant->tenancies()->whereHas('unit.property', function ($query) use ($user) {
            $query->where('owner_id', $user->id);
        })->exists();
    }

    public function create(User $user): bool
    {
        return $user->role === Role::LANDLORD;
    }

    public function update(User $user, Tenant $tenant): bool
    {
        return $this->view($user, $tenant);
    }

    public function delete(User $user, Tenant $tenant): bool
    {
        return $this->view($user, $tenant);
    }
}
