<?php

namespace App\Notifications;

use App\Channels\BroadcastChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TenancyMassExpiry extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $endedCount,
        public int $expiringCount,
        public array $details = []
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', BroadcastChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Daily Tenancy Summary: '.$this->endedCount.' Ended, '.$this->expiringCount.' Expiring')
            ->greeting('Hello Admin,')
            ->line('Here is the daily tenancy summary:')
            ->line("**Tenancies Ended:** {$this->endedCount}")
            ->line("**Tenancies Expiring Soon:** {$this->expiringCount}")
            ->action('View Dashboard', url('/admin/dashboard'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Daily Tenancy Summary',
            'message' => "{$this->endedCount} tenancies ended, {$this->expiringCount} expiring soon.",
            'ended_count' => $this->endedCount,
            'expiring_count' => $this->expiringCount,
            'details' => $this->details,
            'priority' => 'medium',
        ];
    }
}
