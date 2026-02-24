<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function utilities()
    {
        return $this->hasMany(Utility::class);
    }
}
