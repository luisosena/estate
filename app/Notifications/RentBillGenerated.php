<?php

namespace App\Notifications;

use App\Channels\BroadcastChannel;
use App\Channels\ExpoPushChannel;
use App\Channels\WhatsAppChannel;
use App\Models\RentBill;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RentBillGenerated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public RentBill $rentBill) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WhatsAppChannel::class, ExpoPushChannel::class, BroadcastChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $month = $this->rentBill->billing_month ? $this->rentBill->billing_month->format('F Y') : 'this month';

        return (new MailMessage)
            ->subject("New Rent Bill: {$month}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your rent bill for {$month} has been generated.")
            ->line("Amount Due: {$this->rentBill->amount_due}")
            ->action('Pay Now', url(config('app.url')))
            ->line('Please ensure timely payment.');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $month = $this->rentBill->billing_month ? $this->rentBill->billing_month->format('F Y') : 'this month';

        return "Hello {$notifiable->name}, your rent bill for {$month} is ready. Amount due: {$this->rentBill->amount_due}. Please login to pay. - Estate Practice";
    }

    public function toExpoPush(object $notifiable): array
    {
        $month = $this->rentBill->billing_month ? $this->rentBill->billing_month->format('M Y') : 'month';

        return [
            'title' => 'New Rent Bill',
            'body' => "Your rent bill for {$month} ({$this->rentBill->amount_due}) has been generated.",
            'data' => [
                'type' => 'rent_bill_generated',
                'rent_bill_id' => $this->rentBill->id,
            ],
        ];
    }

    public function toArray(object $notifiable): array
    {
        $month = $this->rentBill->billing_month ? $this->rentBill->billing_month->format('F Y') : 'this month';

        return [
            'title' => 'New Rent Bill',
            'message' => "Your rent bill for {$month} has been generated.",
            'priority' => 'medium',
            'rent_bill_id' => $this->rentBill->id,
            'amount_due' => $this->rentBill->amount_due,
            'billing_month' => $month,
        ];
    }
}
