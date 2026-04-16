<?php

namespace App\Policies;

use App\Models\TenancyUtility;
use App\Models\User;

class TenancyUtilityPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord']);
    }

    public function view(User $user, TenancyUtility $tenancyUtility): bool
    {
        if ($user->role === 'admin') return true;
        return $user->role === 'landlord' && $tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord']);
    }

    public function update(User $user, TenancyUtility $tenancyUtility): bool
    {
        if ($user->role === 'admin') return true;
        return $user->role === 'landlord' && $tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }

    public function delete(User $user, TenancyUtility $tenancyUtility): bool
    {
        if ($user->role === 'admin') return true;
        return $user->role === 'landlord' && $tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }
}
