<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'landlord', 'tenant']);
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'landlord') {
            return $payment->tenancy->unit->property->owner_id === $user->id;
        }

        if ($user->role === 'tenant') {
            return $user->tenant_id === $payment->tenant_id;
        }

        return false;
    }

    public function update(User $user, Payment $payment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'landlord' && $payment->tenancy->unit->property->owner_id === $user->id;
    }

    public function delete(User $user, Payment $payment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'landlord' && $payment->tenancy->unit->property->owner_id === $user->id;
    }
}
