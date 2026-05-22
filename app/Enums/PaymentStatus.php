<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Paid = 'paid';
    case Pending = 'pending';
    case Partial = 'partial';
    case Overdue = 'overdue';
    case Waived = 'waived';
}
