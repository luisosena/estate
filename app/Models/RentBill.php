<?php

namespace App\Models;

use App\Enums\BillStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RentBill extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenancy_id',
        'billing_month',
        'amount_due',
        'amount_paid',
        'due_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'billing_month' => 'date',
            'due_date' => 'date',
            'amount_due' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'status' => BillStatus::class,
        ];
    }

    public function tenancy(): BelongsTo
    {
        return $this->belongsTo(Tenancy::class);
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
            $this->status = BillStatus::Paid;
        } elseif ($this->amount_paid > 0) {
            $this->status = BillStatus::Partial;
        }
        $this->save();
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('rent_bills.status', BillStatus::Pending->value);
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('rent_bills.status', BillStatus::Overdue->value)
                ->orWhere(function ($q) {
                    $q->whereIn('rent_bills.status', [BillStatus::Pending->value, BillStatus::Partial->value])
                        ->where('rent_bills.due_date', '<', now());
                });
        });
    }

    /**
     * Get the tenant associated with this rent bill.
     */
    public function getTenantAttribute()
    {
        return $this->tenancy?->tenant;
    }

    /**
     * Get the unit associated with this rent bill.
     */
    public function getUnitAttribute()
    {
        return $this->tenancy?->unit;
    }

    /**
     * Get the property associated with this rent bill.
     */
    public function getPropertyAttribute()
    {
        return $this->tenancy?->unit?->property;
    }
}
