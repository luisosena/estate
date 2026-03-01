<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Unit extends Model
{
    protected $fillable = [
        'property_id',
        'unit_code',
        'unit_name',
        'status',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function tenancies(): HasMany
    {
        return $this->hasMany(Tenancy::class);
    }

    public function tenant()
    {
        return $this->hasOneThrough(Tenant::class, Tenancy::class, 'unit_id', 'id', 'id', 'tenant_id')
            ->where('tenancies.status', 'active');
    }
}
