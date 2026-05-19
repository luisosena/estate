<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\RentBill;
use App\Models\User;
use App\Notifications\PaymentReceived;
use App\Notifications\RentBillGenerated;
use App\Notifications\RentBillOverdue;

class NotificationService
{
    /**
     * Send payment received notification to a user.
     */
    public function sendPaymentReceivedNotification(User $user, Payment $payment): void
    {
        $user->notify(new PaymentReceived($payment));
    }

    /**
     * Send rent bill generated notification to a user.
     */
    public function sendRentBillGeneratedNotification(User $user, RentBill $rentBill): void
    {
        $user->notify(new RentBillGenerated($rentBill));
    }

    /**
     * Send rent bill overdue notification to a user.
     */
    public function sendRentBillOverdueNotification(User $user, RentBill $rentBill): void
    {
        $user->notify(new RentBillOverdue($rentBill));
    }
}
