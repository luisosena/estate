<?php

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;

class TenantPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Tenant $tenant): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'landlord') {
            return $tenant->tenancies()
                ->whereHas('unit.property', function ($query) use ($user) {
                    $query->where('owner_id', $user->id);
                })
                ->exists();
        }

        if ($user->role === 'tenant') {
            return $user->tenant_id === $tenant->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Tenant $tenant): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'landlord') {
            return $tenant->tenancies()
                ->whereHas('unit.property', function ($query) use ($user) {
                    $query->where('owner_id', $user->id);
                })
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Tenant $tenant): bool
    {
        return $user->role === 'admin';
    }
}
