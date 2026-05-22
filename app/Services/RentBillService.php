<?php

namespace App\Services;

use App\Contracts\RentBillServiceInterface;
use App\Models\Payment;
use App\Models\RentBill;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RentBillService implements RentBillServiceInterface
{
    /**
     * Process a rent payment and update the rent bill status.
     *
     * @param  RentBill  $rentBill  The rent bill to update
     * @param  float  $amount  The payment amount
     *
     * @throws InvalidArgumentException If the bill is already paid or waived
     */
    public function processRentPayment(RentBill $rentBill, float $amount): void
    {
        // Verify the bill is payable (not already paid or waived)
        if (in_array($rentBill->status, ['paid', 'waived'])) {
            throw new InvalidArgumentException(
                "This rent bill has already been {$rentBill->status}."
            );
        }

        // Update the rent bill with the payment
        $rentBill->markPaid($amount);
    }

    /**
     * Link a payment to a rent bill for a tenancy.
     * This method handles:
     * - Validating the rent bill belongs to the tenancy
     * - Finding the current month's bill if none specified
     * - Returning the rent bill ID or null if not found/required
     *
     * @param  int  $tenancyId  The tenancy ID
     * @param  int|null  $requestedBillId  The requested rent bill ID (optional)
     * @param  bool  $required  Whether a rent bill is required for rent payments
     * @return array ['rent_bill_id' => int|null, 'error' => string|null]
     */
    public function linkPaymentToBill(int $tenancyId, ?int $requestedBillId = null, bool $required = false): array
    {
        $rentBillId = null;
        $error = null;

        if ($requestedBillId !== null) {
            // Verify the rent bill belongs to this tenancy
            $rentBill = RentBill::where('id', $requestedBillId)
                ->where('tenancy_id', $tenancyId)
                ->first();

            if ($rentBill) {
                if (in_array($rentBill->status, ['paid', 'waived'])) {
                    $error = "This rent bill has already been {$rentBill->status}.";
                } else {
                    $rentBillId = $rentBill->id;
                }
            } else {
                $error = 'The specified rent bill was not found for this tenancy.';
            }
        }

        // If no specific bill provided or not found, try to find one for current month
        if (! $rentBillId && ! $error) {
            $currentBill = $this->getCurrentMonthBill($tenancyId);
            if ($currentBill && ! in_array($currentBill->status, ['paid', 'waived'])) {
                $rentBillId = $currentBill->id;
            }
        }

        // If rent bill is required but none found
        if ($required && ! $rentBillId && ! $error) {
            $error = $requestedBillId
                ? 'The specified rent bill is not valid or already paid.'
                : 'No pending rent bill found for the current month. Please create a rent bill first.';
        }

        return [
            'rent_bill_id' => $rentBillId,
            'error' => $error,
        ];
    }

    /**
     * Create a payment and process rent bill update in a transaction.
     * This ensures atomicity - either both succeed or both fail.
     *
     * @param  array  $paymentData  The payment data
     * @param  int|null  $rentBillId  The rent bill ID to link (optional)
     * @param  float  $paymentAmount  The payment amount
     * @return Payment The created payment
     *
     * @throws InvalidArgumentException If the rent bill processing fails
     */
    public function createPaymentWithRentBill(array $paymentData, ?int $rentBillId, float $paymentAmount): Payment
    {
        return DB::transaction(function () use ($paymentData, $rentBillId, $paymentAmount) {
            // Create the payment
            $payment = Payment::create($paymentData);

            // Process rent payment if linked to a rent bill
            if ($rentBillId) {
                $rentBill = RentBill::find($rentBillId);
                if ($rentBill) {
                    $this->processRentPayment($rentBill, $paymentAmount);
                    // Update payment status based on rent bill (source of truth)
                    $rentBill->refresh();
                    $payment->status = $rentBill->status;
                    $payment->save();
                }
            }

            return $payment;
        });
    }

    /**
     * Waive a rent bill.
     *
     * @param  RentBill  $rentBill  The rent bill to waive
     * @param  string|null  $notes  Optional notes for the waiver
     */
    public function waiveRentBill(RentBill $rentBill, ?string $notes = null): void
    {
        $rentBill->status = 'waived';
        $rentBill->amount_paid = $rentBill->amount_due;
        if ($notes) {
            $rentBill->notes = ($rentBill->notes ? $rentBill->notes."\n" : '')."Waived: {$notes}";
        }
        $rentBill->save();
    }

    /**
     * Get the current month's rent bill for a tenancy.
     *
     * @param  int  $tenancyId  The tenancy ID
     */
    public function getCurrentMonthBill(int $tenancyId): ?RentBill
    {
        return RentBill::where('tenancy_id', $tenancyId)
            ->where('billing_month', now()->startOfMonth())
            ->first();
    }

    /**
     * Get pending rent bills for a tenancy.
     *
     * @param  int  $tenancyId  The tenancy ID
     */
    public function getPendingBills(int $tenancyId): Collection
    {
        return RentBill::where('tenancy_id', $tenancyId)
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->orderBy('billing_month')
            ->get();
    }

    /**
     * Get a paginated list of rent bills for a landlord with statistics.
     */
    public function getRentBillList(User $landlord, Request $request): array
    {
        $status = $request->get('status');
        $search = $request->get('search');

        $query = RentBill::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
            $query->where('owner_id', $landlord->id);
        })
            ->with(['tenancy.tenant', 'tenancy.unit.property'])
            ->orderBy('billing_month', 'desc');

        if ($status && $status !== 'all') {
            $query->where('rent_bills.status', $status);
        }

        // Search logic (Tenant name/code or Unit code)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('tenancy.tenant', function ($q2) use ($search) {
                    $q2->where('full_name', 'like', "%{$search}%")
                        ->orWhere('tenant_code', 'like', "%{$search}%");
                })->orWhereHas('tenancy.unit', function ($q2) use ($search) {
                    $q2->where('unit_code', 'like', "%{$search}%");
                });
            });
        }

        $rentBills = $query->paginate(15);
        $stats = $this->getRentStatistics($landlord);

        return [
            'rent_bills' => $rentBills,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ];
    }

    /**
     * Sync an existing (usually async confirmed) payment to a rent bill.
     * Guards against double-crediting if the bill was already synced synchronously.
     */
    public function syncPaymentWithRentBill(Payment $payment): void
    {
        if ($payment->status !== 'pending') {
            return;
        }

        if ($payment->rent_bill_id) {
            $rentBill = RentBill::find($payment->rent_bill_id);
            if ($rentBill && ! in_array($rentBill->status, ['paid', 'waived'])) {
                $this->processRentPayment($rentBill, (float) $payment->amount);
            }
        }
    }

    /**
     * Calculate total outstanding rent for a tenancy.
     *
     * @param  int  $tenancyId  The tenancy ID
     */
    public function calculateTotalOutstanding(int $tenancyId): float
    {
        return (float) RentBill::where('tenancy_id', $tenancyId)
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->selectRaw('SUM(amount_due - amount_paid) as outstanding')
            ->value('outstanding') ?? 0.0;
    }

    /**
     * Calculate consolidated rent statistics for a landlord dashboard or list.
     */
    public function getRentStatistics(User $landlord): array
    {
        $baseQuery = RentBill::whereHas('tenancy.unit.property', fn ($query) => $query->where('owner_id', $landlord->id));

        $rawStats = (clone $baseQuery)
            ->selectRaw("
                COUNT(*) as total_count,
                SUM(CASE WHEN status = 'pending' AND (due_date >= CURRENT_DATE OR due_date IS NULL) THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'overdue' OR (status IN ('pending', 'partial') AND due_date < CURRENT_DATE) THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') THEN amount_due - amount_paid ELSE 0 END) as total_outstanding
            ")
            ->first();

        return [
            'total' => (int) ($rawStats?->total_count ?? 0),
            'pending' => (int) ($rawStats?->pending_count ?? 0),
            'overdue' => (int) ($rawStats?->overdue_count ?? 0),
            'paid' => (int) ($rawStats?->paid_count ?? 0),
            'total_outstanding' => (float) ($rawStats?->total_outstanding ?? 0),
        ];
    }
}
