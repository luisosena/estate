<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushChannel
{
    public function send(mixed $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toExpoPush')) {
            return;
        }

        $message = $notification->toExpoPush($notifiable);

        $expoPushToken = null;
        if (method_exists($notifiable, 'routeNotificationForExpoPush')) {
            $expoPushToken = $notifiable->routeNotificationForExpoPush($notification);
        } elseif (method_exists($notifiable, 'routeNotificationFor')) {
            $expoPushToken = $notifiable->routeNotificationFor('ExpoPush');
        }

        if (! $expoPushToken && isset($notifiable->expo_push_token)) {
            $expoPushToken = $notifiable->expo_push_token;
        }

        if (! $expoPushToken) {
            Log::debug('Expo Push skipped: no token', ['notifiable' => get_class($notifiable), 'id' => $notifiable->id]);

            return;
        }

        $payload = [
            'to' => $expoPushToken,
            'title' => $message['title'] ?? 'Estate Practice',
            'body' => $message['body'] ?? '',
            'data' => $message['data'] ?? [],
            'sound' => 'default',
        ];

        $retries = 3;
        for ($attempt = 1; $attempt <= $retries; $attempt++) {
            try {
                $response = Http::timeout(10)->post('https://exp.host/--/api/v2/push/send', $payload);

                if ($response->failed()) {
                    Log::error('Expo Push HTTP request failed', [
                        'attempt' => $attempt,
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);

                    if ($attempt < $retries) {
                        sleep(2);

                        continue;
                    }

                    return;
                }

                $status = $response->json();

                if (isset($status['data']['status']) && $status['data']['status'] === 'error') {
                    $details = $status['data']['details'] ?? 'Unknown error';
                    Log::error('Expo Push returned error', ['details' => $details]);

                    if (str_contains(json_encode($details), 'DeviceNotRegistered')) {
                        if (method_exists($notifiable, 'update')) {
                            $notifiable->update([
                                'expo_push_token' => null,
                                'expo_push_token_updated_at' => null,
                            ]);
                            Log::info('Expo Push: cleared invalid token', ['notifiable_id' => $notifiable->id]);
                        }
                    }

                    return;
                }

                Log::debug('Expo Push sent successfully', [
                    'notifiable_id' => $notifiable->id,
                    'title' => $payload['title'],
                ]);

                return;

            } catch (\Exception $e) {
                Log::error('Expo Push Exception', [
                    'attempt' => $attempt,
                    'message' => $e->getMessage(),
                ]);

                if ($attempt < $retries) {
                    sleep(2);

                    continue;
                }
            }
        }
    }
}
