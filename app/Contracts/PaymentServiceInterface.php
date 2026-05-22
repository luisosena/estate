<?php

namespace App\Contracts;

use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

interface PaymentServiceInterface
{
    /**
     * Get all payments for a tenant.
     */
    public function getTenantPayments(Tenant $tenant): Collection;

    /**
     * Calculate the pending rent amount for a tenancy.
     */
    public function calculatePendingRent(?Tenancy $tenancy): float;

    /**
     * Process a payment with business logic.
     */
    public function processPayment(array $validated, Tenancy $activeTenancy, ?Payment $existingPayment = null): array;

    /**
     * Create a new payment record.
     */
    public function createPayment(array $paymentData): Payment;

    /**
     * Process a payment through the configured gateway.
     */
    public function processGatewayPayment(array $data, Tenancy $tenancy): array;

    /**
     * Update an existing payment.
     */
    public function updatePayment(Payment $payment, array $paymentData): Payment;

    /**
     * Delete a payment record.
     */
    public function deletePayment(Payment $payment): bool;
}
