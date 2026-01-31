<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Utility extends Model
{
    protected $fillable = [
        'tenancy_id',
        'type',
        'amount',
        'billing_period',
        'status',
    ];

    public function tenancy()
    {
        return $this->belongsTo(Tenancy::class);
    }
}
