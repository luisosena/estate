<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use App\Enums\Role;

class PaymentPolicy
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

    public function view(User $user, Payment $payment): bool
    {
        if ($user->role === Role::TENANT) {
            return $payment->tenant_id === $user->tenant_id;
        }

        if ($user->role === Role::LANDLORD) {
            return $payment->tenancy->unit->property->owner_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [Role::LANDLORD, Role::TENANT]);
    }

    public function update(User $user, Payment $payment): bool
    {
        if ($user->role === Role::LANDLORD) {
            return $payment->tenancy->unit->property->owner_id === $user->id;
        }
        return false;
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $this->update($user, $payment);
    }
}
