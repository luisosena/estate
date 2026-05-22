<?php

namespace App\Models;

use App\Enums\BillStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UtilityBill extends Model
{
    use HasFactory;

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

    protected function casts(): array
    {
        return [
            'billing_month' => 'date',
            'due_date' => 'date',
            'amount_due' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'units_consumed' => 'decimal:3',
            'status' => BillStatus::class,
        ];
    }

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
            $this->status = BillStatus::Paid;
        } elseif ($this->amount_paid > 0) {
            $this->status = BillStatus::Partial;
        }
        $this->save();
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('utility_bills.status', BillStatus::Pending->value);
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('utility_bills.status', BillStatus::Overdue->value)
                ->orWhere(function ($q) {
                    $q->whereIn('utility_bills.status', [BillStatus::Pending->value, BillStatus::Partial->value])
                        ->where('utility_bills.due_date', '<', now());
                });
        });
    }
}
