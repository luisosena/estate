<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === Role::Admin) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, [Role::Landlord, Role::Tenant]);
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->role === Role::Tenant) {
            return $payment->tenant_id === $user->tenant_id;
        }

        if ($user->role === Role::Landlord) {
            return $payment->tenancy->unit->property->owner_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [Role::Landlord, Role::Tenant]);
    }

    public function update(User $user, Payment $payment): bool
    {
        if ($user->role === Role::Landlord) {
            return $payment->tenancy->unit->property->owner_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $this->update($user, $payment);
    }
}
