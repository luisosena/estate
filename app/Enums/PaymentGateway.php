<?php

namespace App\Enums;

enum PaymentGateway: string
{
    case Manual = 'manual';
    case SafaricomMpesa = 'safaricom_mpesa';
}
