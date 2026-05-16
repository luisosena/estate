<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Document;
use App\Models\Tenancy;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DocumentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === Role::Admin) {
            return true;
        }

        return null;
    }

    public function upload(User $user, Tenancy $tenancy): bool
    {
        if ($user->role === Role::Landlord) {
            return $this->tenancyOwnedByLandlord($tenancy->id, $user->id);
        }

        return false;
    }

    public function view(User $user, Document $document): bool
    {
        $documentable = $document->documentable;

        if (! $documentable instanceof Tenancy) {
            return false;
        }

        if ($user->role === Role::Landlord) {
            return $this->tenancyOwnedByLandlord($documentable->id, $user->id);
        }

        if ($user->role === Role::Tenant) {
            return $user->tenant_id === $documentable->tenant_id;
        }

        return false;
    }

    public function download(User $user, Document $document): bool
    {
        return $this->view($user, $document);
    }

    public function delete(User $user, Document $document): bool
    {
        $documentable = $document->documentable;

        if (! $documentable instanceof Tenancy) {
            return false;
        }

        if ($user->role === Role::Landlord) {
            return $this->tenancyOwnedByLandlord($documentable->id, $user->id);
        }

        return false;
    }

    protected function tenancyOwnedByLandlord(int $tenancyId, int $landlordId): bool
    {
        return DB::table('tenancies')
            ->join('units', 'tenancies.unit_id', '=', 'units.id')
            ->join('properties', 'units.property_id', '=', 'properties.id')
            ->where('tenancies.id', $tenancyId)
            ->where('properties.owner_id', $landlordId)
            ->exists();
    }
}
