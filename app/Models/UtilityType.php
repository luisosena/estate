<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UtilityType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'unit',
        'description',
        'is_metered',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_metered' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function tenancyUtilities(): HasMany
    {
        return $this->hasMany(TenancyUtility::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
