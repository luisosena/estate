<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Collection;

class PaymentService
{
    public function getTenantPayments(Tenant $tenant): Collection
    {
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['payments'])
            ->first();

        return $activeTenancy?->payments
            ->sortByDesc('paid_at')
            ->values() ?? collect();
    }

    public function createPayment(array $paymentData): Payment
    {
        return Payment::create($paymentData);
    }

    public function updatePayment(Payment $payment, array $paymentData): Payment
    {
        $payment->update($paymentData);
        return $payment;
    }

    public function deletePayment(Payment $payment): bool
    {
        return $payment->delete();
    }
}
