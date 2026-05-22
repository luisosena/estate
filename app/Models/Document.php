<?php

namespace App\Models;

use App\Enums\DocumentCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'documentable_type',
        'documentable_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'category',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'uploaded_at' => 'datetime',
            'category' => DocumentCategory::class,
        ];
    }

    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    public function scopeForTenancy(Builder $query): Builder
    {
        return $query->where('documentable_type', Tenancy::class);
    }
}
