<?php

namespace App\Contracts;

interface PaymentGatewayInterface
{
    /**
     * Initiate a payment request using the gateway.
     *
     * @param array $paymentData Raw canonical payment data (amount, tenant_id, etc.)
     * @return array Gateway response containing checkout_request_id, status, etc.
     */
    public function initiate(array $paymentData): array;

    /**
     * Verify a transaction status on the gateway.
     *
     * @param string $transactionId The gateway's internal reference ID
     * @return array Gateway verification result
     */
    public function verify(string $transactionId): array;

    /**
     * Optional refund functionality.
     *
     * @param string $transactionId
     * @param float $amount
     * @return array
     */
    public function refund(string $transactionId, float $amount): array;
}
