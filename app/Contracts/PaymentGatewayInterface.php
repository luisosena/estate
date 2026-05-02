<?php

namespace App\Contracts;

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
interface PaymentGatewayInterface
{
    /**
     * Initiate a payment request using the gateway.
     *
     * @param  array  $paymentData  Raw canonical payment data (amount, tenant_id, etc.)
     * @return array Gateway response containing checkout_request_id, status, etc.
     */
    public function initiate(array $paymentData): array;

    /**
     * Verify a transaction status on the gateway.
     *
     * @param  string  $transactionId  The gateway's internal reference ID
     * @return array Gateway verification result
     */
    public function verify(string $transactionId): array;

    /**
     * Optional refund functionality.
     */
    public function refund(string $transactionId, float $amount): array;
}
