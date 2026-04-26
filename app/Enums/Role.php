<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'admin';
    case Landlord = 'landlord';
    case Tenant = 'tenant';
}
