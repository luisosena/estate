<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Channels\WhatsAppChannel;
use App\Channels\ExpoPushChannel;
use App\Models\RentBill;

class RentBillOverdue extends Notification implements ShouldQueue
{
    use Queueable;

    public $rentBill;

    public function __construct(RentBill $rentBill)
    {
        $this->rentBill = $rentBill;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WhatsAppChannel::class, ExpoPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $month = $this->rentBill->billing_month ? $this->rentBill->billing_month->format('F Y') : 'the previous month';
        return (new MailMessage)
            ->subject('Overdue Rent Reminder')
            ->greeting("Hello {$notifiable->first_name},")
            ->line("This is a gentle reminder that your rent bill for {$month} is overdue.")
            ->line("Outstanding Balance: {$this->rentBill->balance}")
            ->action('Pay Now', url(config('app.url')))
            ->line('Please arrange for payment as soon as possible.');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $month = $this->rentBill->billing_month ? $this->rentBill->billing_month->format('F Y') : 'the previous month';
        return "Hello {$notifiable->first_name}, your rent bill for {$month} is overdue with an outstanding balance of {$this->rentBill->balance}. Please arrange payment soon. - Estate Practice";
    }

    public function toExpoPush(object $notifiable): array
    {
        return [
            'title' => 'Overdue Rent Bill',
            'body' => "Your rent bill has an outstanding balance of {$this->rentBill->balance}. Please pay soon.",
            'data' => [
                'type' => 'rent_bill_overdue',
                'rent_bill_id' => $this->rentBill->id
            ]
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'rent_bill_id' => $this->rentBill->id,
            'balance' => $this->rentBill->balance,
            'message' => "Rent bill overdue. Balance: {$this->rentBill->balance}"
        ];
    }
}
