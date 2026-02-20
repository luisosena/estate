<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    protected $fillable = [
        'owner_id',
        'name',
        'total_units',
        'address',
    ];

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }
}
