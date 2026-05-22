<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Mpesa = 'mpesa';
    case AirtelMoney = 'airtel_money';
    case BankTransfer = 'bank_transfer';
    case Card = 'card';
    case Cash = 'cash';
    case Cheque = 'cheque';
    case MobileMoney = 'mobile_money';
    case Other = 'other';
}
