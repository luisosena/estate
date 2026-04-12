<?php

namespace App\Enums;

enum Role: string {
    case ADMIN = 'admin';
    case LANDLORD = 'landlord';
    case TENANT = 'tenant';
}
