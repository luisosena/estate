<?php

namespace App\Channels;

use App\Events\NotificationCreated as NotificationCreatedEvent;
use Illuminate\Notifications\Notification;

class BroadcastChannel
{
    public function send(mixed $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toArray')) {
            return;
        }

        $data = $notification->toArray($notifiable);
        $data['type'] = $notification::class;

        event(new NotificationCreatedEvent($notifiable->id, $data));
    }
}
