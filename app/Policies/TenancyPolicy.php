<?php

namespace App\Policies;

use App\Models\Tenancy;
use App\Models\User;

class TenancyPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord']);
    }

    public function view(User $user, Tenancy $tenancy): bool
    {
        if ($user->role === 'admin') return true;
        
        if ($user->role === 'landlord') {
            return $tenancy->unit->property->owner_id === $user->id;
        }

        if ($user->role === 'tenant') {
            return $user->tenant_id === $tenancy->tenant_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord']);
    }

    public function update(User $user, Tenancy $tenancy): bool
    {
        if ($user->role === 'admin') return true;
        return $user->role === 'landlord' && $tenancy->unit->property->owner_id === $user->id;
    }

    public function delete(User $user, Tenancy $tenancy): bool
    {
        return $user->role === 'admin';
    }
}
