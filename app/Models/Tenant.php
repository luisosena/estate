<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Notifiable;

class Tenant extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'tenant_code',
        'full_name',
        'phone',
        'email',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
    ];

    // Relationships
    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    public function tenancies(): HasMany
    {
        return $this->hasMany(Tenancy::class);
    }

    public function identifications(): HasMany
    {
        return $this->hasMany(TenantIdentification::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications(): MorphMany
    {
        return $this->morphMany(DatabaseNotification::class, 'notifiable');
    }

    public function getRouteKeyName()
    {
        return 'tenant_code';
    }

    protected static function booted()
    {
        static::creating(function ($tenant) {
            if (! $tenant->tenant_code) {
                $lastId = Tenant::withTrashed()->max('id') + 1;
                $tenant->tenant_code = 'TEN-'.str_pad($lastId, 5, '0', STR_PAD_LEFT);
            }
        });
    }
}
