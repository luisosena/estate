<?php

namespace App\Enums;

enum BillStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Partial = 'partial';
    case Overdue = 'overdue';
    case Waived = 'waived';
}
