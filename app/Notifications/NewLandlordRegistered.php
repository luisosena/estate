<?php

namespace App\Notifications;

use App\Channels\BroadcastChannel;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLandlordRegistered extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $landlord) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', BroadcastChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Landlord Registration: '.$this->landlord->name)
            ->greeting('Hello Admin,')
            ->line('A new landlord has registered on the platform.')
            ->line("**Name:** {$this->landlord->name}")
            ->line("**Email:** {$this->landlord->email}")
            ->line('**Status:** '.($this->landlord->email_verified_at ? 'Verified' : 'Pending Verification'))
            ->action('View Landlord', url('/admin/landlords'))
            ->line('Please review and verify this account if needed.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Landlord Registration: '.$this->landlord->name,
            'message' => "A new landlord {$this->landlord->name} ({$this->landlord->email}) has registered.",
            'landlord_id' => $this->landlord->id,
            'landlord_email' => $this->landlord->email,
            'verified' => (bool) $this->landlord->email_verified_at,
            'priority' => 'medium',
        ];
    }
}
