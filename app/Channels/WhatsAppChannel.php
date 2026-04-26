<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class WhatsAppChannel
{
    protected ?Client $twilio;

    public function __construct()
    {
        // Don't instantiate if credentials are missing to avoid breaking auto-discovery
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');

        if ($sid && $token) {
            $this->twilio = new Client($sid, $token);
        }
    }

    public function send(mixed $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toWhatsApp') || ! $this->twilio) {
            return;
        }

        $message = $notification->toWhatsApp($notifiable);

        $to = null;
        if (method_exists($notifiable, 'routeNotificationForWhatsApp')) {
            $to = $notifiable->routeNotificationForWhatsApp($notification);
        } elseif (method_exists($notifiable, 'routeNotificationFor')) {
            $to = $notifiable->routeNotificationFor('WhatsApp');
        }

        if (! $to && isset($notifiable->phone)) {
            $to = $notifiable->phone;
        }

        if (! $to) {
            return;
        }

        $from = config('services.twilio.whatsapp_from');

        try {
            $this->twilio->messages->create(
                "whatsapp:{$to}",
                [
                    'from' => "whatsapp:{$from}",
                    'body' => $message,
                ]
            );
        } catch (\Exception $e) {
            Log::error('WhatsApp Notification failed: '.$e->getMessage());
        }
    }
}
