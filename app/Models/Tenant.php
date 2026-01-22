<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'unit_number',
        'rent_amount',
        'status',
        'lease_start',
        'lease_end',
    ];

    protected $casts = [
        'rent_amount' => 'decimal:2',
        'lease_start' => 'date',
        'lease_end' => 'date',
    ];
}