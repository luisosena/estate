<?php

namespace App\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;

class MpesaGateway implements PaymentGatewayInterface
{
    protected $config;

    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    public function initiate(array $paymentData): array
    {
        // Integration with Safaricom Daraja API logic goes here.
        // For MVP, we return a mock pending push state
        
        return [
            'checkout_request_id' => 'ws_CO_' . date('dmYHis') . rand(100, 999),
            'status' => 'pending', // Waiting for webhook callback
        ];
    }

    public function verify(string $transactionId): array
    {
        return [
            'status' => 'pending', // Typically STK push relies on callbacks
        ];
    }

    public function refund(string $transactionId, float $amount): array
    {
        throw new \Exception("M-Pesa refund via gateway API is not fully automated without B2C/B2B APIs");
    }
}
