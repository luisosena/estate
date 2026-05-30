<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\CsvImportBatch;
use App\Models\User;

class CsvImportBatchPolicy
{
    /**
     * Admins pass all gates unconditionally — consistent with every other policy.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === Role::Admin) {
            return true;
        }

        return null;
    }

    /**
     * Decision #12: viewAny gates the index page.
     * Only landlords can view the import history list.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    /**
     * A landlord can only view their own batch result page.
     */
    public function view(User $user, CsvImportBatch $batch): bool
    {
        return $user->id === $batch->user_id;
    }

    /**
     * Only landlords can create import batches.
     */
    public function create(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    /**
     * Decision #17: both admins and landlords may download the CSV template.
     * Admins pass via before(). This method covers landlords explicitly.
     */
    public function downloadTemplate(User $user): bool
    {
        return $user->role === Role::Landlord;
    }
}
