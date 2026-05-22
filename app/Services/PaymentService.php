<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use App\Contracts\PaymentServiceInterface;
use App\Contracts\RentBillServiceInterface;
use App\Contracts\UtilityServiceInterface;
use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\UtilityBill;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PaymentService implements PaymentServiceInterface
{
    public function __construct(
        protected ?PaymentGatewayInterface $gateway = null,
        protected ?RentBillServiceInterface $rentBillService = null,
        protected ?UtilityServiceInterface $utilityService = null
    ) {}

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
            // Row-level locking to prevent race conditions
            $lockedTenancy = Tenancy::lockForUpdate()->find($activeTenancy->id);
            if (! $lockedTenancy) {
                return ['error' => 'Transaction conflict. Please try again.'];
            }

            // 1. Duplicate prevention
            if (! $existingPayment) {
                $recentDuplicate = $activeTenancy->payments()
                    ->where('amount', $validated['amount'])
                    ->where('payment_method', $validated['payment_method'])
                    ->where('payment_type', $validated['payment_type'])
                    ->where('created_at', '>=', now()->subSeconds(30))
                    ->exists();

                if ($recentDuplicate) {
                    return ['error' => 'A duplicate payment was recently submitted. Please wait a moment and try again.'];
                }
            }

            $monthlyRent = $activeTenancy->monthly_rent ?? 0;
            $status = 'pending';
            $utilityBillId = $validated['utility_bill_id'] ?? null;
            $rentBillId = null;
            $rentBillError = null;
            $excessAmount = 0;

            // Calculate excess amount for rent payments (overpayment handling)
            if ($validated['payment_type'] === 'rent' && $monthlyRent > 0) {
                $currentTotalPaid = $activeTenancy->payments()
                    ->whereIn('status', ['paid', 'partial'])
                    ->where('payment_type', 'rent')
                    ->when($existingPayment, fn ($q) => $q->where('id', '!=', $existingPayment->id))
                    ->sum('amount');
                $remainingBalance = max(0, $monthlyRent - $currentTotalPaid);
                if ($validated['amount'] > $remainingBalance) {
                    $excessAmount = $validated['amount'] - $remainingBalance;
                }
            }

            // 2. Business Logic for Rent vs Utility
            if ($validated['payment_type'] === 'utility' && $utilityBillId) {
                $bill = UtilityBill::with('tenancyUtility.tenancy.unit.property')->find($utilityBillId);
                if (! $bill) {
                    return ['error' => 'Utility bill not found.'];
                }
                if ($bill->tenancyUtility->tenancy_id !== $activeTenancy->id) {
                    return ['error' => 'This utility bill does not belong to your active tenancy.'];
                }
                if (in_array($bill->status, ['paid', 'waived'])) {
                    return ['error' => 'This utility bill has already been '.$bill->status.'.'];
                }

                $utilityService = $this->utilityService ?? app(UtilityServiceInterface::class);
                $utilityService->processUtilityPayment($bill, $validated['amount']);
                $bill->refresh();
                $status = $bill->status;

                // Validate the synced status is allowed
                if (! in_array($status, ['paid', 'partial', 'overdue', 'pending'])) {
                    $status = 'partial'; // Safe fallback
                }
            } elseif ($validated['payment_type'] === 'rent') {
                $rentBillService = $this->rentBillService ?? app(RentBillServiceInterface::class);
                $billLinkResult = $rentBillService->linkPaymentToBill(
                    $activeTenancy->id,
                    ! empty($validated['rent_bill_id']) ? (int) $validated['rent_bill_id'] : null,
                    false // Not required - allows payments without bill
                );
                $rentBillId = $billLinkResult['rent_bill_id'];
                $rentBillError = $billLinkResult['error'];
            }

            // 3. Create or update payment record
            $paymentData = [
                'tenant_id' => $activeTenancy->tenant_id,
                'tenancy_id' => $activeTenancy->id,
                'rent_bill_id' => $rentBillId,
                'utility_bill_id' => $utilityBillId,
                'amount' => $validated['amount'],
                'payment_type' => $validated['payment_type'],
                'payment_method' => $validated['payment_method'],
                'status' => $status,
                'paid_at' => now(),
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ];

            $payment = null;
            $rentBillWarning = null;

            // Handle rent payments with rent bill processing
            if ($validated['payment_type'] === 'rent' && $rentBillId) {
                try {
                    $rentBillService = $this->rentBillService ?? app(RentBillServiceInterface::class);
                    $payment = $rentBillService->createPaymentWithRentBill(
                        $paymentData,
                        $rentBillId,
                        $validated['amount']
                    );
                } catch (\InvalidArgumentException $e) {
                    $rentBillWarning = $e->getMessage();
                    $payment = Payment::create($paymentData);
                }
            } else {
                if ($existingPayment) {
                    $existingPayment->update($paymentData);
                    $payment = $existingPayment;
                } else {
                    $payment = Payment::create($paymentData);
                }
            }

            return [
                'success' => true,
                'payment' => $payment,
                'excessAmount' => $excessAmount,
                'warning' => $rentBillWarning,
                'rentBillError' => $rentBillError,
            ];
        });
    }

    public function createPayment(array $paymentData): Payment
    {
        return Payment::create($paymentData);
    }

    /**
     * Centralized payment processing logic replacing controllers' duplications.
     * SCAFFOLD: Gateway-integrated processing logic.
     */
    public function processGatewayPayment(array $data, Tenancy $tenancy): array
    {
        return DB::transaction(function () use ($data, $tenancy) {
            $lockedTenancy = Tenancy::lockForUpdate()->find($tenancy->id);
            if (! $lockedTenancy) {
                throw new \Exception('Transaction conflict. Please try again.');
            }

            // Anti-duplicate protection for idempotency
            $recentDuplicate = $tenancy->payments()
                ->where('amount', $data['amount'])
                ->where('payment_method', $data['payment_method'])
                ->where('payment_type', $data['payment_type'])
                ->where('created_at', '>=', now()->subSeconds(30))
                ->exists();

            if ($recentDuplicate) {
                throw new \Exception('A duplicate payment was recently submitted. Please wait a moment and try again.');
            }

            $rentBillId = null;
            $rentBillWarning = null;
            $utilityBill = null;

            if ($data['payment_type'] === 'rent') {
                $billLinkResult = $this->rentBillService->linkPaymentToBill(
                    $tenancy->id,
                    ! empty($data['rent_bill_id']) ? (int) $data['rent_bill_id'] : null,
                    false
                );
                $rentBillId = $billLinkResult['rent_bill_id'];
                $rentBillWarning = $billLinkResult['error'];
            }

            if ($data['payment_type'] === 'utility' && ! empty($data['utility_bill_id'])) {
                $utilityBill = UtilityBill::with('tenancyUtility.tenancy')->find($data['utility_bill_id']);
                if (! $utilityBill || $utilityBill->tenancyUtility->tenancy_id !== $tenancy->id) {
                    throw new \InvalidArgumentException('Invalid utility bill or unauthorized.');
                }
                if (in_array($utilityBill->status, ['paid', 'waived'])) {
                    throw new \InvalidArgumentException("This utility bill has already been {$utilityBill->status}.");
                }
            }

            // Fire off to the selected Payment Gateway Interface
            $gatewayResponse = $this->gateway->initiate($data);

            $paymentData = [
                'tenant_id' => $tenancy->tenant_id,
                'tenancy_id' => $tenancy->id,
                'rent_bill_id' => $rentBillId,
                'utility_bill_id' => $data['utility_bill_id'] ?? null,
                'amount' => $data['amount'],
                'payment_type' => $data['payment_type'],
                'payment_method' => $data['payment_method'],
                'status' => $data['status'] ?? $gatewayResponse['status'] ?? 'pending',
                'paid_at' => $data['paid_at'] ?? now(),
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
                'gateway' => config('payments.default_gateway', 'manual'),
                'checkout_request_id' => $gatewayResponse['checkout_request_id'] ?? null,
                'gateway_reference' => $gatewayResponse['gateway_reference'] ?? null,
                'gateway_status' => $gatewayResponse['status'] ?? null,
            ];

            $payment = null;

            // Handle synchronous resolutions (e.g. ManualGateway or already resolved)
            if ($gatewayResponse['status'] === 'success' || in_array($paymentData['status'], ['paid', 'partial'])) {

                if ($data['payment_type'] === 'utility' && $utilityBill) {
                    $this->utilityService->processUtilityPayment($utilityBill, $data['amount']);
                    $utilityBill->refresh();
                    $paymentData['status'] = $utilityBill->status;
                    $payment = Payment::create($paymentData);
                } elseif ($data['payment_type'] === 'rent' && $rentBillId) {
                    try {
                        $payment = $this->rentBillService->createPaymentWithRentBill(
                            $paymentData, $rentBillId, $data['amount']
                        );
                    } catch (\InvalidArgumentException $e) {
                        $rentBillWarning = $e->getMessage();
                        $payment = Payment::create($paymentData);
                    }
                } else {
                    $payment = Payment::create($paymentData);
                }

            } else {
                // Pending STK push / async resolution. Webhook will process the side-effects later.
                $paymentData['status'] = 'pending';
                $payment = Payment::create($paymentData);
            }

            return [
                'payment' => $payment->loadMissing(['tenant', 'tenancy.unit.property', 'rentBill']),
                'warning' => $rentBillWarning,
            ];
        });
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
