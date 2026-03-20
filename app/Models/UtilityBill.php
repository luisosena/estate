<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UtilityBill extends Model
{
    protected $fillable = [
        'tenancy_utility_id',
        'billing_month',
        'units_consumed',
        'amount_due',
        'amount_paid',
        'due_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'billing_month'   => 'date',
        'due_date'        => 'date',
        'amount_due'      => 'decimal:2',
        'amount_paid'     => 'decimal:2',
        'units_consumed'  => 'decimal:3',
    ];

    public function tenancyUtility(): BelongsTo
    {
        return $this->belongsTo(TenancyUtility::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getOutstandingAmountAttribute(): float
    {
        return max(0, $this->amount_due - $this->amount_paid);
    }

    public function markPaid(float $amount): void
    {
        $this->amount_paid += $amount;
        if ($this->amount_paid >= $this->amount_due) {
            $this->status = 'paid';
        } elseif ($this->amount_paid > 0) {
            $this->status = 'partial';
        }
        $this->save();
    }

    public function scopePending($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeOverdue($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where(function ($q) {
            $q->where('status', 'overdue')
              ->orWhere(function ($q) {
                  $q->whereIn('status', ['pending', 'partial'])
                    ->where('due_date', '<', now());
              });
        });
    }
}
