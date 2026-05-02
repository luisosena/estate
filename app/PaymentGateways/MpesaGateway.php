<?php

namespace App\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;

/**
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 *
 * This file is part of the payment gateway scaffold. It has been ported from
 * the `architectural-refactoring` branch but is NOT yet wired into the
 * application. No route, controller, or service provider references this file.
 *
 * To activate: follow docs/plans/porting-plan.md Phase 3 wiring steps.
 * To remove:   follow the teardown inventory in handoff_payment_scaffold.md.
 */
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
            'checkout_request_id' => 'ws_CO_'.date('dmYHis').rand(100, 999),
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
        throw new \Exception('M-Pesa refund via gateway API is not fully automated without B2C/B2B APIs');
    }
}
