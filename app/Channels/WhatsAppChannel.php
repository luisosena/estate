<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    protected $twilio;

    public function __construct()
    {
        // Don't instantiate if credentials are missing to avoid breaking auto-discovery or construct errors
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        if ($sid && $token) {
            $this->twilio = new Client($sid, $token);
        }
    }

    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toWhatsApp') || !$this->twilio) {
            return;
        }

        $message = $notification->toWhatsApp($notifiable);
        
        // Define how we get the phone number
        $to = null;
        if (method_exists($notifiable, 'routeNotificationForWhatsApp')) {
            $to = $notifiable->routeNotificationForWhatsApp($notification);
        } elseif (method_exists($notifiable, 'routeNotificationFor')) {
            $to = $notifiable->routeNotificationFor('WhatsApp');
        }

        // Fallback to model's phone property
        if (!$to && isset($notifiable->phone)) {
            $to = $notifiable->phone;
        }

        if (!$to) {
            return;
        }

        // WhatsApp requires E.164 format. E.g. +254712345678
        // If it starts with 0, replacing it with country code is usually project-specific.
        // Let's assume the phone number is either already standard or we pass it exactly.
        
        $from = config('services.twilio.whatsapp_from');

        try {
            $this->twilio->messages->create(
                "whatsapp:{$to}",
                [
                    "from" => "whatsapp:{$from}",
                    "body" => $message
                ]
            );
        } catch (\Exception $e) {
            Log::error("WhatsApp Notification failed: " . $e->getMessage());
        }
    }
}
