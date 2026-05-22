<?php

namespace App\Contracts;

use App\Models\Payment;
use App\Models\RentBill;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

interface RentBillServiceInterface
{
    /**
     * Process a rent payment and update the rent bill status.
     */
    public function processRentPayment(RentBill $rentBill, float $amount): void;

    /**
     * Link a payment to a rent bill for a tenancy.
     *
     * @return array['rent_bill_id' => int|null, 'error' => string|null]
     */
    public function linkPaymentToBill(int $tenancyId, ?int $requestedBillId = null, bool $required = false): array;

    /**
     * Create a payment and process rent bill update in a transaction.
     */
    public function createPaymentWithRentBill(array $paymentData, ?int $rentBillId, float $paymentAmount): Payment;

    /**
     * Waive a rent bill.
     */
    public function waiveRentBill(RentBill $rentBill, ?string $notes = null): void;

    /**
     * Get the current month's rent bill for a tenancy.
     */
    public function getCurrentMonthBill(int $tenancyId): ?RentBill;

    /**
     * Get pending rent bills for a tenancy.
     */
    public function getPendingBills(int $tenancyId): Collection;

    /**
     * Get a paginated list of rent bills for a landlord with statistics.
     */
    public function getRentBillList(User $landlord, Request $request): array;

    /**
     * Sync an existing payment to a rent bill.
     */
    public function syncPaymentWithRentBill(Payment $payment): void;

    /**
     * Calculate total outstanding rent for a tenancy.
     */
    public function calculateTotalOutstanding(int $tenancyId): float;

    /**
     * Calculate consolidated rent statistics for a landlord dashboard or list.
     */
    public function getRentStatistics(User $landlord): array;
}
