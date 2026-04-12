<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\UtilityBill;
use App\Contracts\PaymentGatewayInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct(
        protected PaymentGatewayInterface $gateway,
        protected RentBillService $rentBillService,
        protected UtilityService $utilityService
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
     * Centralized payment processing logic replacing controllers' duplications.
     */
    public function processPayment(array $data, Tenancy $tenancy): array
    {
        return DB::transaction(function () use ($data, $tenancy) {
            $lockedTenancy = Tenancy::lockForUpdate()->find($tenancy->id);
            if (!$lockedTenancy) {
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
                    !empty($data['rent_bill_id']) ? (int) $data['rent_bill_id'] : null,
                    false
                );
                $rentBillId = $billLinkResult['rent_bill_id'];
                $rentBillWarning = $billLinkResult['error'];
            }

            if ($data['payment_type'] === 'utility' && !empty($data['utility_bill_id'])) {
                $utilityBill = UtilityBill::with('tenancyUtility.tenancy')->find($data['utility_bill_id']);
                if (!$utilityBill || $utilityBill->tenancyUtility->tenancy_id !== $tenancy->id) {
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
                } else if ($data['payment_type'] === 'rent' && $rentBillId) {
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
                'warning' => $rentBillWarning
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
