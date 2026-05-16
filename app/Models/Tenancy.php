<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Tenancy extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'unit_id',
        'move_in_date',
        'move_out_date',
        'monthly_rent',
        'security_deposit',
        'tenancy_agreement_path',
        'status',
        'deposit_return_status',
        'final_meter_readings',
        'rent_due_day',
    ];

    protected $appends = ['tenant_code'];

    protected function casts(): array
    {
        return [
            'move_in_date' => 'date',
            'move_out_date' => 'date',
            'monthly_rent' => 'decimal:2',
            'security_deposit' => 'decimal:2',
            'final_meter_readings' => 'array',
        ];
    }

    public function getTenantCodeAttribute()
    {
        return $this->tenant?->tenant_code;
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * New utility relationships for the refactored utility system.
     * These link to tenancy_utilities (which utilities apply to this tenancy).
     */
    public function tenancyUtilities(): HasMany
    {
        return $this->hasMany(TenancyUtility::class);
    }

    public function activeUtilities(): HasMany
    {
        return $this->hasMany(TenancyUtility::class)->where('tenancy_utilities.status', 'active');
    }

    /**
     * Rent bills for this tenancy.
     */
    public function rentBills(): HasMany
    {
        return $this->hasMany(RentBill::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Scope a query to only include active tenancies.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('tenancies.status', 'active');
    }

    public function scopeAgreement(Builder $query): Builder
    {
        return $query->whereHas('documents', function ($q) {
            $q->where('category', 'tenancy_agreement');
        });
    }
}
