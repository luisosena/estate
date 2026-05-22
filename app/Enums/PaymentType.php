<?php

namespace App\Enums;

enum PaymentType: string
{
    case Rent = 'rent';
    case Utility = 'utility';
}
