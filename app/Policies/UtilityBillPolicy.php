<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UtilityBill;

class UtilityBillPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord', 'tenant']);
    }

    public function view(User $user, UtilityBill $utilityBill): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'landlord') {
            return $utilityBill->tenancyUtility->tenancy->unit->property->owner_id === $user->id;
        }

        if ($user->role === 'tenant') {
            return $user->tenant_id === $utilityBill->tenancyUtility->tenancy->tenant_id;
        }

        return false;
    }

    public function waive(User $user, UtilityBill $utilityBill): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'landlord' && $utilityBill->tenancyUtility->tenancy->unit->property->owner_id === $user->id;
    }
}
