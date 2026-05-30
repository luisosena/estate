<?php

namespace App\Models;

use App\Enums\CsvImportStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CsvImportBatch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'original_filename',
        'stored_path',
        'status',
        'total_rows',
        'processed_rows',
        'created_rows',
        'failed_rows',
        'row_errors',
        'import_summary',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => CsvImportStatus::class,
            'row_errors' => 'array',
            'import_summary' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasErrors(): bool
    {
        return ! empty($this->row_errors);
    }
}
