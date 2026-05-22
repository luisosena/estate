<?php

namespace App\Enums;

enum TenancyStatus: string
{
    case Active = 'active';
    case Ended = 'ended';
    case Terminated = 'terminated';
    case Expired = 'expired';
}
