<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (Payment $payment) {
            // Validate utility_bill_id if provided
            if ($payment->utility_bill_id !== null) {
                // Skip validation if utility_bill_id wasn't changed
                if (! $payment->isDirty('utility_bill_id')) {
                    return;
                }

                $bill = $payment->utilityBill;

                if (! $bill) {
                    throw new \InvalidArgumentException(
                        "utility_bill_id {$payment->utility_bill_id} does not exist."
                    );
                }

                if (! $bill->tenancyUtility || $bill->tenancyUtility->tenancy_id !== $payment->tenancy_id) {
                    throw new \InvalidArgumentException(
                        "Payment tenancy_id ({$payment->tenancy_id}) does not match ".
                        "the tenancy of utility_bill_id ({$payment->utility_bill_id}). ".
                        'Tenancy mismatch detected.'
                    );
                }
            }

            // Validate rent_bill_id if provided
            if ($payment->rent_bill_id !== null) {
                // Skip validation if rent_bill_id wasn't changed
                if (! $payment->isDirty('rent_bill_id')) {
                    return;
                }

                $rentBill = $payment->rentBill;

                if (! $rentBill) {
                    throw new \InvalidArgumentException(
                        "rent_bill_id {$payment->rent_bill_id} does not exist."
                    );
                }

                if ($rentBill->tenancy_id !== $payment->tenancy_id) {
                    throw new \InvalidArgumentException(
                        "Payment tenancy_id ({$payment->tenancy_id}) does not match ".
                        "the tenancy of rent_bill_id ({$payment->rent_bill_id}). ".
                        'Tenancy mismatch detected.'
                    );
                }
            }
        });
    }

    protected $fillable = [
        'tenant_id',
        'tenancy_id',
        'utility_bill_id',
        'rent_bill_id',
        'amount',
        'payment_type',
        'payment_method',
        'status',
        'paid_at',
        'receipt_path',
        'due_date',
        'reference_number',
        'notes',
        // SCAFFOLD: gateway fields — see PaymentGatewayInterface
        'gateway',
        'checkout_request_id',
        'gateway_reference',
        'gateway_status',
        'gateway_metadata',
        'gateway_confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'due_date' => 'date',
            'deleted_at' => 'datetime',
            'gateway_metadata' => 'array',
            'gateway_confirmed_at' => 'datetime',
        ];
    }

    protected $appends = ['tenant_code'];

    public function getTenantCodeAttribute()
    {
        return $this->tenant?->tenant_code;
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function tenancy(): BelongsTo
    {
        return $this->belongsTo(Tenancy::class);
    }

    /**
     * Link to the utility bill this payment covers (for utility payments).
     */
    public function utilityBill(): BelongsTo
    {
        return $this->belongsTo(UtilityBill::class);
    }

    /**
     * Link to the rent bill this payment covers (for rent payments).
     */
    public function rentBill(): BelongsTo
    {
        return $this->belongsTo(RentBill::class);
    }

    /**
     * Calculate payment status based on total paid vs monthly rent.
     * Accepts optional Tenancy parameter to avoid N+1 queries.
     *
     * Note: This calculates status based on rent payments only.
     * Utility payments are considered separately.
     *
     * @param  string|null  $paymentType  Filter by payment type (rent or utility)
     */
    public function calculateStatus(?Tenancy $tenancy = null, ?string $paymentType = null): string
    {
        $tenancy = $tenancy ?? $this->tenancy;
        if (! $tenancy) {
            return 'partial';
        }

        // Validate payment type if provided
        if ($paymentType !== null && ! in_array($paymentType, ['rent', 'utility'], true)) {
            return 'partial';
        }

        $monthlyRent = $tenancy->monthly_rent;

        $query = $tenancy->payments()
            ->whereIn('status', ['paid', 'partial']);

        // Filter by payment type if specified
        if ($paymentType) {
            $query->where('payment_type', $paymentType);
        } else {
            // Default to rent payments only for backwards compatibility
            $query->where('payment_type', 'rent');
        }

        $totalPaid = $query->sum('amount');

        if ($totalPaid >= $monthlyRent) {
            return 'paid';
        } elseif ($totalPaid > 0) {
            return 'partial';
        }

        return 'pending';
    }

    /**
     * Calculate pending amount for a tenancy.
     *
     * @param  string|null  $paymentType  Filter by payment type (rent or utility)
     */
    public static function calculatePendingAmount(Tenancy $tenancy, ?string $paymentType = null): float
    {
        $monthlyRent = $tenancy->monthly_rent ?? 0;

        $query = $tenancy->payments()
            ->whereIn('status', ['paid', 'partial']);

        // Filter by payment type if specified
        if ($paymentType) {
            $query->where('payment_type', $paymentType);
        } else {
            // Default to rent payments only for backwards compatibility
            $query->where('payment_type', 'rent');
        }

        $totalPaid = $query->sum('amount');

        return max(0, $monthlyRent - $totalPaid);
    }
}
