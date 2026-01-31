<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = [
        'unit_code',
        'unit_name',
        'status',
    ];

    public function tenancies()
    {
        return $this->hasMany(Tenancy::class);
    }
}
