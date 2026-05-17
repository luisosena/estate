<?php

namespace App\Notifications;

use App\Channels\BroadcastChannel;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LandlordVerified extends Notification implements ShouldQueue
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
            ->subject('Landlord Account Verified: '.$this->landlord->name)
            ->greeting('Hello Admin,')
            ->line("The landlord account {$this->landlord->name} ({$this->landlord->email}) has been verified.")
            ->action('View Landlord', url('/admin/landlords'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Landlord Verified: '.$this->landlord->name,
            'message' => "Landlord {$this->landlord->name} has been verified.",
            'landlord_id' => $this->landlord->id,
            'priority' => 'low',
        ];
    }
}
