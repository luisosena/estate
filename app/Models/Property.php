<?php

namespace App\Models;

use App\Enums\PropertyStatus;
use App\Traits\HasActiveScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Property extends Model
{
    use HasActiveScope, HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'total_units',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'property_type',
        'status',
        'description',
        'amenities',
        'policies',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'policies' => 'array',
            'status' => PropertyStatus::class,
        ];
    }

    protected function getActiveStatusValue(): string
    {
        return PropertyStatus::Active->value;
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    public function tenancies(): HasManyThrough
    {
        return $this->hasManyThrough(
            Tenancy::class,
            Unit::class,
            'property_id', // Foreign key on units table...
            'unit_id',     // Foreign key on tenancies table...
            'id',          // Local key on properties table...
            'id'           // Local key on units table...
        );
    }
}
