<?php

namespace App\Helpers;

class RoleRedirects
{
    public static function urlByRole(string $role): string
    {
        return match ($role) {
            'admin' => '/admin/dashboard',
            'landlord' => '/landlord/dashboard',
            'tenant' => '/tenant/dashboard',
            default => '/dashboard',
        };
    }
}
