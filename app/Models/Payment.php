<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'tenant_id',
        'tenancy_id',
        'amount',
        'payment_type',
        'payment_method',
        'status',
        'paid_at',
        'receipt_path',
        'due_date',
        'reference_number',
        'notes',
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];

    protected $appends = ['tenant_code'];

    public function getTenantCodeAttribute()
    {
        return $this->tenant?->tenant_code;
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function tenancy()
    {
        return $this->belongsTo(Tenancy::class);
    }

    /**
     * Calculate payment status based on total paid vs monthly rent.
     * Accepts optional Tenancy parameter to avoid N+1 queries.
     * 
     * Note: This calculates status based on rent payments only.
     * Utility payments are considered separately.
     *
     * @param Tenancy|null $tenancy
     * @param string|null $paymentType Filter by payment type (rent or utility)
     */
    public function calculateStatus(Tenancy $tenancy = null, string $paymentType = null): string
    {
        $tenancy = $tenancy ?? $this->tenancy;
        if (!$tenancy) {
            return 'partial';
        }

        // Validate payment type if provided
        if ($paymentType !== null && !in_array($paymentType, ['rent', 'utility'], true)) {
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

        return 'overdue';
    }

    /**
     * Calculate pending amount for a tenancy.
     * 
     * @param Tenancy $tenancy
     * @param string|null $paymentType Filter by payment type (rent or utility)
     */
    public static function calculatePendingAmount(Tenancy $tenancy, string $paymentType = null): float
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
