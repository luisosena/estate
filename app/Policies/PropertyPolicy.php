<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;
use App\Enums\Role;

class PropertyPolicy
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

    public function view(User $user, Property $property): bool
    {
        return $property->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::LANDLORD;
    }

    public function update(User $user, Property $property): bool
    {
        return $property->owner_id === $user->id;
    }

    public function delete(User $user, Property $property): bool
    {
        return $property->owner_id === $user->id;
    }

    public function restore(User $user, Property $property): bool
    {
        return $property->owner_id === $user->id;
    }

    public function forceDelete(User $user, Property $property): bool
    {
        return $property->owner_id === $user->id;
    }
}
