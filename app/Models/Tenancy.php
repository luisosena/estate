<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenancy extends Model
{
    protected $fillable = [
        'tenant_id',
        'unit_id',
        'move_in_date',
        'move_out_date',
        'monthly_rent',
        'security_deposit',
        'tenancy_agreement_path',
        'status',
        'end_reason',
        'deposit_return_status',
        'final_meter_readings',
    ];

    protected $appends = ['tenant_code'];

    public function getTenantCodeAttribute()
    {
        return $this->tenant?->tenant_code;
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Legacy utilities relationship - points to old utilities table.
     * Note: This should be renamed or removed after data migration.
     */
    public function utilities()
    {
        return $this->hasMany(Utility::class);
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
        return $this->hasMany(TenancyUtility::class)->where('status', 'active');
    }
}
