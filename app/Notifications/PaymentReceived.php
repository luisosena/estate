<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Channels\WhatsAppChannel;
use App\Channels\ExpoPushChannel;
use App\Models\Payment;

class PaymentReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', WhatsAppChannel::class, ExpoPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Receipt: Payment Received')
            ->greeting("Hello {$notifiable->first_name},")
            ->line("We have received a payment of {$this->payment->amount} for your tenancy.")
            ->line("Payment Type: {$this->payment->payment_type}")
            ->line("Status: {$this->payment->status}")
            ->action('View Dashboard', url(config('app.url')))
            ->line('Thank you for being a great tenant!');
    }

    public function toWhatsApp(object $notifiable): string
    {
        return "Hello {$notifiable->first_name}, we've received your payment of {$this->payment->amount} for {$this->payment->payment_type}. Status: {$this->payment->status}. Thank you! - Estate Practice";
    }

    public function toExpoPush(object $notifiable): array
    {
        return [
            'title' => 'Payment Received',
            'body' => "We've received your {$this->payment->payment_type} payment of {$this->payment->amount}.",
            'data' => [
                'type' => 'payment_received',
                'payment_id' => $this->payment->id
            ]
        ];
    }

    /**
     * Get the array representation of the notification (for database/broadcast).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'type' => $this->payment->payment_type,
            'status' => $this->payment->status,
            'message' => "Payment of {$this->payment->amount} received."
        ];
    }
}
