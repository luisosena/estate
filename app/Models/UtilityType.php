<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UtilityType extends Model
{
    protected $fillable = [
        'name',
        'unit',
        'description',
        'is_metered',
        'is_active',
    ];

    protected $casts = [
        'is_metered' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function tenancyUtilities(): HasMany
    {
        return $this->hasMany(TenancyUtility::class);
    }

    public function scopeActive($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }
}
