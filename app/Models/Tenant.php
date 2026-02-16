<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Make sure this is imported

class Tenant extends Model
{
    use SoftDeletes; // Uncomment this line

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
    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function tenancies()
    {
        return $this->hasMany(Tenancy::class);
    }

    public function identifications()
    {
        return $this->hasMany(TenantIdentification::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function getRouteKeyName()
    {
        return 'tenant_code';
    }

    protected static function booted()
    {
        static::creating(function ($tenant) {
            if (!$tenant->tenant_code) {
                $lastId = Tenant::withTrashed()->max('id') + 1;
                $tenant->tenant_code = 'TEN-' . str_pad($lastId, 5, '0', STR_PAD_LEFT);
            }
        });
    }
}