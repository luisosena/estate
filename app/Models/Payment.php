<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'tenant_id',
        'tenancy_id',
        'amount',
        'payment_type',
        'payment_method',
        'status',
        'paid_at',
        'receipt_path',
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

    public function tenancy()
    {
        return $this->belongsTo(Tenancy::class);
    }
}
