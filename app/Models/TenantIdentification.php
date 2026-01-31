<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantIdentification extends Model
{
    protected $fillable = [
        'tenant_id',
        'id_type',
        'id_number',
        'document_path',
        'verified_at',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
