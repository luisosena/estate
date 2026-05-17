<?php

namespace App\Notifications;

use App\Channels\BroadcastChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SystemError extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public array $context = []
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', BroadcastChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'context' => $this->context,
            'priority' => 'high',
        ];
    }
}
