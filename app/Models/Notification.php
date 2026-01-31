<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'tenant_id',
        'type',
        'title',
        'message',
        'read_at',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
