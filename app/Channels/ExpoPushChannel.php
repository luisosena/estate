<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushChannel
{
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toExpoPush')) {
            return;
        }

        $message = $notification->toExpoPush($notifiable);
        
        $expoPushToken = null;
        if (method_exists($notifiable, 'routeNotificationForExpoPush')) {
            $expoPushToken = $notifiable->routeNotificationForExpoPush($notification);
        } elseif (method_exists($notifiable, 'routeNotificationFor')) {
            $expoPushToken = $notifiable->routeNotificationFor('ExpoPush');
        }

        // Fallback to model property
        if (!$expoPushToken && isset($notifiable->expo_push_token)) {
            $expoPushToken = $notifiable->expo_push_token;
        }

        if (!$expoPushToken) {
            return;
        }

        try {
            $response = Http::post('https://exp.host/--/api/v2/push/send', [
                'to' => $expoPushToken,
                'title' => $message['title'] ?? 'Estate Practice',
                'body' => $message['body'] ?? '',
                'data' => $message['data'] ?? [],
                'sound' => 'default',
            ]);

            if ($response->failed()) {
                Log::error("Expo Push HTTP Request failed: " . $response->body());
            } else {
                $status = $response->json();
                if (isset($status['data']['status']) && $status['data']['status'] === 'error') {
                    Log::error("Expo Push returned error: " . collect($status['data']['details'])->toJson());
                }
            }
        } catch (\Exception $e) {
            Log::error("Expo Push Exception: " . $e->getMessage());
        }
    }
}
