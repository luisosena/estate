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
class ManualGateway implements PaymentGatewayInterface
{
    public function initiate(array $paymentData): array
    {
        return [
            'checkout_request_id' => 'MANUAL_'.uniqid(),
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
            'status' => 'refunded',
        ];
    }
}
