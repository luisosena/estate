<?php

namespace App\Policies;

use App\Models\RentBill;
use App\Models\User;
use App\Enums\Role;

class RentBillPolicy
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
        return in_array($user->role, [Role::LANDLORD, Role::TENANT]);
    }

    public function view(User $user, RentBill $rentBill): bool
    {
        if ($user->role === Role::TENANT) {
            return $rentBill->tenancy->tenant_id === $user->tenant_id;
        }

        if ($user->role === Role::LANDLORD) {
            return $rentBill->tenancy->unit->property->owner_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::LANDLORD;
    }

    public function update(User $user, RentBill $rentBill): bool
    {
        if ($user->role === Role::LANDLORD) {
            return $rentBill->tenancy->unit->property->owner_id === $user->id;
        }
        return false;
    }

    public function delete(User $user, RentBill $rentBill): bool
    {
        return $this->update($user, $rentBill);
    }
}
