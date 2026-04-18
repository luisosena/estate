<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenancyUtility extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenancy_id',
        'utility_type_id',
        'amount',
        'billing_cycle',
        'provider',
        'account_number',
        'meter_number',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function tenancy(): BelongsTo
    {
        return $this->belongsTo(Tenancy::class);
    }

    public function utilityType(): BelongsTo
    {
        return $this->belongsTo(UtilityType::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(UtilityBill::class);
    }

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'active');
    }
}
