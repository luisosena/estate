<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\UtilityBill;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

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

    /**
     * Calculate the pending rent amount for a tenancy.
     */
    public function calculatePendingRent(?Tenancy $tenancy): float
    {
        if (! $tenancy) {
            return 0.0;
        }

        $monthlyRent = $tenancy->monthly_rent ?? 0;

        $totalPaid = $tenancy->payments()
            ->whereIn('status', ['paid', 'partial'])
            ->where('payment_type', 'rent')
            ->sum('amount');

        return (float) max(0, $monthlyRent - $totalPaid);
    }

    public function processPayment(array $validated, Tenancy $activeTenancy, ?Payment $existingPayment = null): array
    {
        return DB::transaction(function () use ($validated, $activeTenancy, $existingPayment) {
            // 1. Duplicate prevention
            if (! $existingPayment) {
                $recentDuplicate = $activeTenancy->payments()
                    ->where('amount', $validated['amount'])
                    ->where('payment_method', $validated['payment_method'])
                    ->where('payment_type', $validated['payment_type'])
                    ->where('created_at', '>=', now()->subSeconds(30))
                    ->exists();

                if ($recentDuplicate) {
                    return ['error' => 'A duplicate payment was recently submitted. Please wait a moment.'];
                }
            }

            $monthlyRent = $activeTenancy->monthly_rent ?? 0;
            $status = 'partial';
            $utilityBillId = $validated['utility_bill_id'] ?? null;

            // 2. Business Logic for Rent vs Utility
            if ($validated['payment_type'] === 'utility' && $utilityBillId) {
                $bill = UtilityBill::find($utilityBillId);
                if ($bill) {
                    $utilityService = app(UtilityService::class);
                    $utilityService->processUtilityPayment($bill, $validated['amount']);
                    $bill->refresh();
                    $status = $bill->status;
                }
            } elseif ($validated['payment_type'] === 'rent') {
                $currentTotalPaid = $activeTenancy->payments()
                    ->whereIn('status', ['paid', 'partial'])
                    ->where('payment_type', 'rent')
                    ->when($existingPayment, fn ($q) => $q->where('id', '!=', $existingPayment->id))
                    ->sum('amount');

                if ($currentTotalPaid + $validated['amount'] >= $monthlyRent) {
                    $status = 'paid';
                }
            }

            // 3. Create or update payment record
            $paymentData = [
                'tenant_id' => $activeTenancy->tenant_id,
                'tenancy_id' => $activeTenancy->id,
                'utility_bill_id' => $utilityBillId,
                'amount' => $validated['amount'],
                'payment_type' => $validated['payment_type'],
                'payment_method' => $validated['payment_method'],
                'status' => $status,
                'paid_at' => now(),
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ];

            if ($existingPayment) {
                $existingPayment->update($paymentData);
                $payment = $existingPayment;
            } else {
                $payment = Payment::create($paymentData);
            }

            return ['success' => true, 'payment' => $payment];
        });
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
