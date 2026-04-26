<?php

namespace App\Helpers;

use App\Enums\Role;

class RoleRedirects
{
    public static function urlByRole(Role|string $role): string
    {
        // Accept both enum instance and raw string (e.g. from tests / old code)
        $value = $role instanceof Role ? $role->value : $role;

        return match ($value) {
            'admin' => '/admin/dashboard',
            'landlord' => '/landlord/dashboard',
            'tenant' => '/tenant/dashboard',
            default => '/dashboard',
        };
    }
}
