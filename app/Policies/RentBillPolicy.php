<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\RentBill;
use App\Models\User;

class RentBillPolicy
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

    public function view(User $user, RentBill $rentBill): bool
    {
        if ($user->role === Role::Tenant) {
            return RentBill::where('id', $rentBill->id)
                ->whereHas('tenancy', fn ($query) => $query->where('tenant_id', $user->tenant_id))
                ->exists();
        }

        if ($user->role === Role::Landlord) {
            return RentBill::where('id', $rentBill->id)
                ->whereHas('tenancy.unit.property', fn ($query) => $query->where('owner_id', $user->id))
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    public function update(User $user, RentBill $rentBill): bool
    {
        if ($user->role === Role::Landlord) {
            return RentBill::where('id', $rentBill->id)
                ->whereHas('tenancy.unit.property', fn ($query) => $query->where('owner_id', $user->id))
                ->exists();
        }

        return false;
    }

    public function delete(User $user, RentBill $rentBill): bool
    {
        return $this->update($user, $rentBill);
    }

    /** Preserved from main — landlord-specific waiver action. */
    public function waive(User $user, RentBill $rentBill): bool
    {
        return $this->update($user, $rentBill);
    }
}
