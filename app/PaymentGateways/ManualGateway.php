<?php

namespace App\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;

class ManualGateway implements PaymentGatewayInterface
{
    public function initiate(array $paymentData): array
    {
        return [
            'checkout_request_id' => 'MANUAL_' . uniqid(),
            'status' => 'success', // Manual transitions instantly to success usually, or pending
            'gateway_reference' => $paymentData['payment_method'] ?? 'cash',
        ];
    }

    public function verify(string $transactionId): array
    {
        return [
            'status' => 'success',
            'verified_at' => now(),
        ];
    }

    public function refund(string $transactionId, float $amount): array
    {
        return [
            'status' => 'refunded'
        ];
    }
}
