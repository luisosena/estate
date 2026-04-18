<?php

namespace App\Policies;

use App\Models\RentBill;
use App\Models\User;

class RentBillPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord', 'tenant']);
    }

    public function view(User $user, RentBill $rentBill): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'landlord') {
            return $rentBill->tenancy->unit->property->owner_id === $user->id;
        }

        if ($user->role === 'tenant') {
            return $user->tenant_id === $rentBill->tenancy->tenant_id;
        }

        return false;
    }

    public function waive(User $user, RentBill $rentBill): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'landlord' && $rentBill->tenancy->unit->property->owner_id === $user->id;
    }
}
