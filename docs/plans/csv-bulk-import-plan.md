# CSV Bulk-Import Onboarding — Revised Implementation Plan

> **Audience:** A coding model executing this feature end-to-end.
> Every section is a binding contract. Follow it exactly. Do not invent deviations.
> This revision incorporates all 20 resolved implicit decisions.

---

## 0. Hard Constraints & Project-Wide Rules

### 0.1 Architecture (enforced by `tests/Feature/ArchTest.php`)

| Rule | Constraint |
|------|-----------|
| No debug calls | `dd`, `dump`, `var_dump`, `ray`, `ddd` banned in `App\` |
| FormRequests | Must extend `Illuminate\Foundation\Http\FormRequest` |
| Models | Must use `Illuminate\Database\Eloquent\Factories\HasFactory` |
| Services | Concrete, non-abstract, in `App\Services\` |
| Policies | Concrete classes |

### 0.2 Code Style (Pint)

Run `vendor/bin/pint --dirty --format agent` after every PHP file is created or modified.

- Curly braces on all control structures including single-line bodies.
- PHP 8 constructor property promotion: `public function __construct(protected Foo $foo) {}`.
- No empty zero-parameter `__construct()`.
- Explicit return types on all methods.
- PHPDoc `@return array<string, mixed>` shape for all array returns.
- `use Illuminate\Support\Facades\DB;` — never mix `\DB::` and the facade import in the same file.

### 0.3 Wayfinder

Run `php artisan wayfinder:generate` after routes are registered.
Generates `resources/js/actions/Web/Landlord/CsvImportController.ts`.
All frontend route calls import from that generated file — never hardcoded strings.

### 0.4 File Generation Commands

```bash
php artisan make:migration create_csv_import_batches_table --no-interaction
php artisan make:model CsvImportBatch --factory --no-interaction
php artisan make:request Landlord/CsvImportUploadRequest --no-interaction
php artisan make:request Landlord/CsvImportConfirmRequest --no-interaction
php artisan make:controller Web/Landlord/CsvImportController --no-interaction
php artisan make:policy CsvImportBatchPolicy --no-interaction
php artisan make:notification CsvImportCompleted --no-interaction
php artisan make:test Landlord/CsvImportTest --pest --no-interaction
php artisan make:test Services/CsvImportServiceTest --pest --no-interaction
```

Create `app/Enums/CsvImportStatus.php` manually (Artisan enum generation is version-dependent).

### 0.5 No New Composer Packages

CSV parsing uses PHP's native `SplFileObject`. Do **not** add `phpoffice/phpspreadsheet`.

---

## Resolved Decision Log

| # | Decision | Resolution |
|---|----------|-----------|
| 1 | Tenant dedup key | Phone only — leave as is |
| 2 | Tenant user account creation | **Integrated** — creates `User` record per tenant when email is present |
| 3 | All-or-nothing vs partial import | **Partial** — valid rows import, failed rows are skipped with errors recorded |
| 4 | Double file upload | **Solved** — preview stores file with a token; confirm sends token only |
| 5 | `property_type` values | **Aligned** with `PropertyFactory`: `apartment`, `house`, `commercial`, `mixed` |
| 6 | Payment import | **Held** — not implemented in v1 |
| 7 | Payment status | **Held** — not implemented in v1 |
| 8 | Future `move_in_date` | **Allowed** — validation accepts any valid date including future dates |
| 9 | Counter bug | **Fixed** — `processed_rows` and `created_rows` track independently |
| 10 | `cascadeOnDelete` | **Explicit decision** — cascade is correct; batch records have no meaning without the landlord |
| 11 | Template in gitignore | User will update `.gitignore` manually |
| 12 | `create` ability for index | **Fixed** — uses `viewAny`; policy method added |
| 13 | `isset()` on normalised null | **Fixed** — replaced with `!== null` |
| 14 | Same as 13 | **Fixed** |
| 15 | BOM stripping absent | **Fixed** — `ltrim` added to `parseCsv` header line |
| 16 | No notification | **Added** — database notification to landlord and all admin users |
| 17 | `template()` no auth | **Fixed** — admins and landlords authorised |
| 18 | Batch created before file stored | **Fixed** — UUID determined first, file stored, then batch created atomically |
| 19 | No `SoftDeletes` | **Added** to model and migration |
| 20 | `$batch` by value in closure | **Fixed** — counters accumulated outside the closure |

---

## 1. Database Migration

### File
`database/migrations/YYYY_MM_DD_HHMMSS_create_csv_import_batches_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('csv_import_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // Decision #10: cascadeOnDelete — batch records are meaningless without
            // the owning landlord. This differs from Document (nullOnDelete) where
            // documents may outlive their uploader for audit purposes.
            $table->string('original_filename', 255);
            $table->string('stored_path', 500);
            // Decision #18: stored_path is NOT nullable. UUID is determined before
            // file storage and batch creation happen together atomically.
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])
                  ->default('pending');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('processed_rows')->default(0);
            $table->unsignedInteger('created_rows')->default(0);
            $table->unsignedInteger('failed_rows')->default(0);
            $table->json('row_errors')->nullable();
            // null = no errors; never store empty [].
            // Contains validation errors AND runtime import errors.
            $table->json('import_summary')->nullable();
            // null until status = completed.
            // Shape: {properties, units, tenants, tenancies, users}
            $table->timestamp('completed_at')->nullable();
            $table->softDeletes(); // Decision #19
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('csv_import_batches');
    }
};
```

---

## 2. Enum

### File: `app/Enums/CsvImportStatus.php`

```php
<?php

namespace App\Enums;

enum CsvImportStatus: string
{
    case Pending    = 'pending';
    case Processing = 'processing';
    case Completed  = 'completed';
    case Failed     = 'failed';
    case Cancelled  = 'cancelled';
}
```

TitleCase keys — consistent with `PaymentStatus`, `TenancyStatus`, `PropertyStatus`.

---

## 3. Model

### File: `app/Models/CsvImportBatch.php`

```php
<?php

namespace App\Models;

use App\Enums\CsvImportStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CsvImportBatch extends Model
{
    use HasFactory, SoftDeletes; // Decision #19

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
            'status'         => CsvImportStatus::class,
            'row_errors'     => 'array',
            'import_summary' => 'array',
            'completed_at'   => 'datetime',
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
```

---

## 4. Factory

### File: `database/factories/CsvImportBatchFactory.php`

```php
<?php

namespace Database\Factories;

use App\Enums\CsvImportStatus;
use App\Models\CsvImportBatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CsvImportBatch>
 */
class CsvImportBatchFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'           => User::factory(),
            'original_filename' => $this->faker->word().'.csv',
            'stored_path'       => 'csv-imports/'.$this->faker->uuid().'/'.$this->faker->word().'.csv',
            'status'            => CsvImportStatus::Pending,
            'total_rows'        => 0,
            'processed_rows'    => 0,
            'created_rows'      => 0,
            'failed_rows'       => 0,
            'row_errors'        => null,
            'import_summary'    => null,
            'completed_at'      => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'         => CsvImportStatus::Completed,
            'total_rows'     => 3,
            'processed_rows' => 3,
            'created_rows'   => 3,
            'failed_rows'    => 0,
            'import_summary' => [
                'properties' => 1,
                'units'      => 3,
                'tenants'    => 3,
                'tenancies'  => 3,
                'users'      => 3,
            ],
            'completed_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'      => CsvImportStatus::Failed,
            'total_rows'  => 2,
            'failed_rows' => 2,
            'row_errors'  => [
                ['row' => 2, 'field' => 'tenant_phone', 'message' => 'Phone number is invalid.'],
            ],
        ]);
    }

    public function partial(): static
    {
        // Decision #3: partial import — some rows succeed, some fail
        return $this->state(fn (array $attributes) => [
            'status'         => CsvImportStatus::Completed,
            'total_rows'     => 3,
            'processed_rows' => 3,
            'created_rows'   => 2,
            'failed_rows'    => 1,
            'row_errors'     => [
                ['row' => 2, 'field' => 'unit_code', 'message' => 'Unit B1 in Sunrise Apts already has an active tenant.'],
            ],
            'import_summary' => [
                'properties' => 1,
                'units'      => 2,
                'tenants'    => 2,
                'tenancies'  => 2,
                'users'      => 2,
            ],
            'completed_at' => now(),
        ]);
    }
}
```

---

## 5. CSV Template File

### File: `storage/app/templates/tenant-import-template.csv`

**Decision #6 & #7:** Payment columns are not included. Template has **17 columns**.

```
property_name,property_address,property_city,property_state,property_type,unit_code,unit_name,tenant_full_name,tenant_email,tenant_phone,emergency_contact_name,emergency_contact_phone,emergency_contact_relation,move_in_date,monthly_rent,security_deposit,rent_due_day
Sunrise Apartments,123 Moi Avenue,Nairobi,Nairobi County,apartment,A1,Unit A1,Jane Wanjiku,jane@example.com,0712345678,John Wanjiku,0798765432,Spouse,2024-01-15,25000,50000,1
Sunrise Apartments,123 Moi Avenue,Nairobi,Nairobi County,apartment,A2,Unit A2,Peter Otieno,peter@example.com,0723456789,Mary Otieno,0789012345,Sister,2025-09-01,20000,40000,1
```

**Column contract (17 columns):**

| # | Column | Required | Rules |
|---|--------|----------|-------|
| 1 | `property_name` | ✅ | string, max:255. Matched case-insensitively against landlord's existing properties. |
| 2 | `property_address` | ✅ | string, max:255. Only used on property **create** — ignored on match. |
| 3 | `property_city` | ✅ | string, max:100. Only used on **create**. |
| 4 | `property_state` | ❌ | string, max:100. Nullable. |
| 5 | `property_type` | ❌ | One of: `apartment`, `house`, `commercial`, `mixed`. Defaults to `apartment` when blank. **Decision #5** |
| 6 | `unit_code` | ✅ | string, max:50. Must be unique within its property in the file AND have no active tenancy in DB. |
| 7 | `unit_name` | ✅ | string, max:255. |
| 8 | `tenant_full_name` | ✅ | string, max:255. |
| 9 | `tenant_email` | ❌ | valid email, max:255. Required for user account creation — see §7 Decision #2. |
| 10 | `tenant_phone` | ✅ | `/^\+?[0-9\s\-\(\)]{7,20}$/` |
| 11 | `emergency_contact_name` | ✅ | string, max:255. |
| 12 | `emergency_contact_phone` | ✅ | same phone regex. |
| 13 | `emergency_contact_relation` | ✅ | string, max:100. |
| 14 | `move_in_date` | ✅ | `YYYY-MM-DD`. Any valid date including future dates. **Decision #8** |
| 15 | `monthly_rent` | ✅ | numeric, min:1. |
| 16 | `security_deposit` | ❌ | numeric, min:0. Defaults to `0` when blank. |
| 17 | `rent_due_day` | ❌ | integer 1–28. Defaults to `1` when blank. |

---

## 6. Form Requests

### 6.1 Preview Request

### File: `app/Http/Requests/Landlord/CsvImportUploadRequest.php`

Used only by the `preview()` controller action.

```php
<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class CsvImportUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === Role::Landlord;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'csv_file.required' => 'Please select a CSV file to upload.',
            'csv_file.mimes'    => 'The file must be a CSV file (.csv).',
            'csv_file.max'      => 'The CSV file must not exceed 5 MB.',
        ];
    }
}
```

### 6.2 Confirm Request

### File: `app/Http/Requests/Landlord/CsvImportConfirmRequest.php`

**Decision #4:** Confirms an import using a `preview_token` from the preview step.
No file upload required on confirmation.

```php
<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;

class CsvImportConfirmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === Role::Landlord;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'preview_token'     => ['required', 'string', 'uuid'],
            'original_filename' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'preview_token.required' => 'Preview session expired. Please re-upload your file.',
            'preview_token.uuid'     => 'Invalid preview token.',
        ];
    }

    /**
     * Resolve the stored file path from the preview token.
     */
    public function storedPath(): string
    {
        return 'csv-imports/preview/'.$this->input('preview_token').'.csv';
    }

    /**
     * Confirm the preview file actually exists in storage.
     */
    public function previewFileExists(): bool
    {
        return Storage::exists($this->storedPath());
    }
}
```

---

## 7. Service: `CsvImportService`

### File: `app/Services/Landlord/CsvImportService.php`

```php
<?php

namespace App\Services\Landlord;

use App\Enums\CsvImportStatus;
use App\Enums\Role;
use App\Models\CsvImportBatch;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CsvImportService
{
    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Parse and validate a CSV file without persisting anything.
     * Also persists the file to temporary storage and returns a preview_token.
     *
     * Decision #4: the file is stored here so that store() does not require
     * a second upload. The preview_token is passed to the frontend and returned
     * in the confirm form.
     *
     * @return array{
     *     rows: array<int, array<string, string>>,
     *     errors: array<int, array{row: int, field: string, message: string}>,
     *     total_rows: int,
     *     valid_count: int,
     *     error_count: int,
     *     preview_token: string,
     *     original_filename: string
     * }
     */
    public function preview(User $landlord, \Illuminate\Http\UploadedFile $file): array
    {
        // Store file temporarily under a UUID token.
        // Decision #4: this eliminates the need for re-upload on confirmation.
        $token     = Str::uuid()->toString();
        $tempPath  = 'csv-imports/preview/'.$token.'.csv';
        Storage::put($tempPath, file_get_contents($file->getRealPath()));

        $rows   = $this->parseCsv(Storage::path($tempPath));
        $errors = $this->validateRows($rows, $landlord);

        $errorRowNumbers = array_unique(array_column($errors, 'row'));

        return [
            'rows'              => $rows,
            'errors'            => $errors,
            'total_rows'        => count($rows),
            'valid_count'       => count($rows) - count($errorRowNumbers),
            'error_count'       => count($errorRowNumbers),
            'preview_token'     => $token,
            'original_filename' => $file->getClientOriginalName(),
        ];
    }

    /**
     * Execute the import for all rows that pass validation.
     * Rows that fail validation or encounter a runtime error are skipped and
     * recorded in row_errors. Valid rows are committed individually.
     *
     * Decision #3: partial import — each row runs in its own transaction.
     * A failure on row 7 does not roll back rows 1–6.
     *
     * @return CsvImportBatch The updated batch after import completes.
     */
    public function import(User $landlord, CsvImportBatch $batch): CsvImportBatch
    {
        $rows   = $this->parseCsv(Storage::path($batch->stored_path));
        $errors = $this->validateRows($rows, $landlord);

        // Build a set of row numbers that failed validation (1-based)
        $failedRowNumbers = [];
        foreach ($errors as $error) {
            $failedRowNumbers[$error['row']] = true;
        }

        $summary = [
            'properties' => 0,
            'units'      => 0,
            'tenants'    => 0,
            'tenancies'  => 0,
            'users'      => 0,
        ];

        $processedRows = 0;
        $createdRows   = 0;
        $failedRows    = count($failedRowNumbers);
        // Pre-count validation failures; runtime failures added below.

        // Decision #9 fix: counters accumulated outside any transaction/closure
        // so no phantom state on rollback.
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1;
            $processedRows++;

            // Skip rows that failed validation
            if (isset($failedRowNumbers[$rowNumber])) {
                continue;
            }

            try {
                // Decision #3: per-row transaction — a failure here does not
                // affect already-committed rows.
                $result = DB::transaction(function () use ($row, $landlord) {
                    return $this->importRow($row, $landlord);
                });

                // Decision #9: only increment created_rows on success
                $createdRows++;

                if ($result['property_created']) {
                    $summary['properties']++;
                }
                if ($result['unit_created']) {
                    $summary['units']++;
                }
                if ($result['tenant_created']) {
                    $summary['tenants']++;
                }
                if ($result['user_created']) {
                    $summary['users']++;
                }
                $summary['tenancies']++;

            } catch (\Throwable $e) {
                // Runtime failure — record it alongside validation errors
                $errors[] = [
                    'row'     => $rowNumber,
                    'field'   => 'import',
                    'message' => 'Row could not be imported: '.$e->getMessage(),
                ];
                $failedRows++;
            }
        }

        $batch->update([
            'status'         => CsvImportStatus::Completed,
            'processed_rows' => $processedRows,
            'created_rows'   => $createdRows,
            'failed_rows'    => $failedRows,
            'row_errors'     => empty($errors) ? null : $errors,
            'import_summary' => $summary,
            'completed_at'   => now(),
        ]);

        return $batch->fresh();
    }

    /**
     * Return paginated batch history for a landlord (most recent first).
     */
    public function getBatchHistory(User $landlord, int $perPage = 15): LengthAwarePaginator
    {
        return CsvImportBatch::where('user_id', $landlord->id)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    // -------------------------------------------------------------------------
    // CSV Parsing
    // -------------------------------------------------------------------------

    /**
     * Parse a CSV file at the given absolute path into an array of associative rows.
     * Header row is excluded from output. All values are trimmed.
     *
     * Decision #15: BOM stripping applied to the first header cell.
     * Decision #13/#14: empty strings remain as '' here — normalised to null
     * only inside validateRow() and importRow() to keep parseCsv() pure.
     *
     * @return array<int, array<string, string>>
     */
    protected function parseCsv(string $absolutePath): array
    {
        $file = new \SplFileObject($absolutePath, 'r');
        $file->setFlags(
            \SplFileObject::READ_CSV |
            \SplFileObject::SKIP_EMPTY |
            \SplFileObject::DROP_NEW_LINE
        );

        $headers = null;
        $rows    = [];

        foreach ($file as $line) {
            if ($headers === null) {
                $trimmed = array_map('trim', $line);
                // Decision #15: strip UTF-8 BOM that Excel adds on CSV export.
                $trimmed[0] = ltrim($trimmed[0], "\xEF\xBB\xBF");
                $headers = $trimmed;
                continue;
            }

            // Skip rows that are entirely whitespace
            if (empty(array_filter($line, fn ($v) => trim((string) $v) !== ''))) {
                continue;
            }

            // Pad or truncate to match header count (guards against ragged rows)
            $padded = array_pad(
                array_slice($line, 0, count($headers)),
                count($headers),
                ''
            );

            $rows[] = array_map('trim', array_combine($headers, $padded));
        }

        return $rows;
    }

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    /**
     * Validate all rows. Row numbers in errors are 1-based (header excluded).
     * Includes field-level rules, cross-row duplicate detection,
     * and a single pre-loaded DB check for occupied units.
     *
     * @param  array<int, array<string, string>>  $rows
     * @return array<int, array{row: int, field: string, message: string}>
     */
    protected function validateRows(array $rows, User $landlord): array
    {
        $errors = [];

        // Track unit keys seen within this file for cross-row duplicate detection.
        // Key: "{lowercase_property_name}::{lowercase_unit_code}"
        $seenUnitKeys = [];

        // Pre-load occupied unit keys in a single query — no N+1.
        $occupiedUnitKeys = $this->loadOccupiedUnitKeys($landlord);

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1;
            $rowErrors = $this->validateRow($row, $rowNumber);

            $unitKey = strtolower(trim($row['property_name'] ?? ''))
                .'::'.strtolower(trim($row['unit_code'] ?? ''));

            // Cross-row: duplicate unit_code within same property in this file
            if (! empty($row['unit_code']) && isset($seenUnitKeys[$unitKey])) {
                $rowErrors[] = [
                    'row'     => $rowNumber,
                    'field'   => 'unit_code',
                    'message' => "Unit code '{$row['unit_code']}' appears more than once "
                        ."for property '{$row['property_name']}' in this file.",
                ];
            } else {
                $seenUnitKeys[$unitKey] = $rowNumber;
            }

            // DB cross-check: unit already has an active tenancy
            if (! empty($row['property_name'])
                && ! empty($row['unit_code'])
                && isset($occupiedUnitKeys[$unitKey])
            ) {
                $rowErrors[] = [
                    'row'     => $rowNumber,
                    'field'   => 'unit_code',
                    'message' => "Unit '{$row['unit_code']}' in '{$row['property_name']}' "
                        .'already has an active tenant.',
                ];
            }

            $errors = array_merge($errors, $rowErrors);
        }

        return $errors;
    }

    /**
     * Validate a single row using Laravel's Validator facade.
     * Empty strings are normalised to null before validation so that
     * nullable rules behave correctly.
     *
     * @param  array<string, string>  $row
     * @return array<int, array{row: int, field: string, message: string}>
     */
    protected function validateRow(array $row, int $rowNumber): array
    {
        $phoneRegex = '/^\+?[0-9\s\-\(\)]{7,20}$/';

        $rules = [
            'property_name'              => ['required', 'string', 'max:255'],
            'property_address'           => ['required', 'string', 'max:255'],
            'property_city'              => ['required', 'string', 'max:100'],
            'property_state'             => ['nullable', 'string', 'max:100'],
            // Decision #5: values aligned with PropertyFactory
            'property_type'              => ['nullable', Rule::in(['apartment', 'house', 'commercial', 'mixed'])],
            'unit_code'                  => ['required', 'string', 'max:50'],
            'unit_name'                  => ['required', 'string', 'max:255'],
            'tenant_full_name'           => ['required', 'string', 'max:255'],
            'tenant_email'               => ['nullable', 'email', 'max:255'],
            'tenant_phone'               => ['required', 'string', 'max:20', 'regex:'.$phoneRegex],
            'emergency_contact_name'     => ['required', 'string', 'max:255'],
            'emergency_contact_phone'    => ['required', 'string', 'max:20', 'regex:'.$phoneRegex],
            'emergency_contact_relation' => ['required', 'string', 'max:100'],
            // Decision #8: any valid date, including future dates
            'move_in_date'               => ['required', 'date_format:Y-m-d'],
            'monthly_rent'               => ['required', 'numeric', 'min:1'],
            'security_deposit'           => ['nullable', 'numeric', 'min:0'],
            'rent_due_day'               => ['nullable', 'integer', 'min:1', 'max:28'],
            // Decisions #6 & #7: payment columns not present — no rules needed
        ];

        // Normalise empty strings to null so nullable rules work correctly.
        // Decision #13/#14: use explicit null check downstream, not isset().
        $data = array_map(fn ($v) => $v === '' ? null : $v, $row);

        $validator = Validator::make($data, $rules);

        if ($validator->passes()) {
            return [];
        }

        $errors = [];
        foreach ($validator->errors()->toArray() as $field => $messages) {
            $errors[] = [
                'row'     => $rowNumber,
                'field'   => $field,
                'message' => $messages[0],
            ];
        }

        return $errors;
    }

    /**
     * Pre-load all occupied unit keys for this landlord in a single JOIN query.
     * A unit is occupied when it has an active tenancy.
     *
     * Key format: "{lowercase_property_name}::{lowercase_unit_code}"
     *
     * @return array<string, true>
     */
    protected function loadOccupiedUnitKeys(User $landlord): array
    {
        $rows = DB::table('tenancies')
            ->join('units', 'tenancies.unit_id', '=', 'units.id')
            ->join('properties', 'units.property_id', '=', 'properties.id')
            ->where('properties.owner_id', $landlord->id)
            ->where('tenancies.status', 'active')
            ->select('properties.name as property_name', 'units.unit_code')
            ->get();

        $map = [];
        foreach ($rows as $row) {
            $key       = strtolower($row->property_name).'::'.strtolower($row->unit_code);
            $map[$key] = true;
        }

        return $map;
    }

    // -------------------------------------------------------------------------
    // Row Import (called inside a per-row DB::transaction)
    // -------------------------------------------------------------------------

    /**
     * Import a single validated row.
     * MUST be called inside DB::transaction() — each call is its own transaction
     * boundary managed by the caller in import().
     *
     * Decision #2: creates a User account for the tenant when email is present
     * and no existing user with that email exists.
     *
     * Decisions #6 & #7: payment creation is not implemented.
     *
     * @param  array<string, string>  $row  (already trimmed; empty strings normalised to null)
     * @return array{
     *     property_created: bool,
     *     unit_created: bool,
     *     tenant_created: bool,
     *     user_created: bool
     * }
     */
    protected function importRow(array $row, User $landlord): array
    {
        // Normalise: replace empty strings with null
        $row = array_map(fn ($v) => $v === '' ? null : $v, $row);

        $result = [
            'property_created' => false,
            'unit_created'     => false,
            'tenant_created'   => false,
            'user_created'     => false,
        ];

        // 1. Upsert Property — match by (owner_id, name) case-insensitively.
        $property = Property::where('owner_id', $landlord->id)
            ->whereRaw('LOWER(name) = ?', [strtolower($row['property_name'])])
            ->first();

        if (! $property) {
            $property = Property::create([
                'owner_id'      => $landlord->id,
                'name'          => $row['property_name'],
                'address'       => $row['property_address'],
                'city'          => $row['property_city'],
                'state'         => $row['property_state'],
                // Decision #5: default to 'apartment', matching PropertyFactory
                'property_type' => $row['property_type'] ?? 'apartment',
                'status'        => 'active',
                'total_units'   => 0,
            ]);
            $result['property_created'] = true;
        }

        // 2. Upsert Unit — match by (property_id, unit_code) case-insensitively.
        $unit = Unit::where('property_id', $property->id)
            ->whereRaw('LOWER(unit_code) = ?', [strtolower($row['unit_code'])])
            ->first();

        if (! $unit) {
            $unit = Unit::create([
                'property_id' => $property->id,
                'unit_code'   => $row['unit_code'],
                'unit_name'   => $row['unit_name'],
                'status'      => 'available',
            ]);
            // Mirrors UnitService::createUnit — increment property counter per unit
            $property->increment('total_units');
            $result['unit_created'] = true;
        }

        // 3. Upsert Tenant — match by phone (Decision #1: phone-only dedup).
        $tenantExists = Tenant::where('phone', $row['tenant_phone'])->exists();

        $tenant = Tenant::updateOrCreate(
            ['phone' => $row['tenant_phone']],
            [
                'full_name'                  => $row['tenant_full_name'],
                'email'                      => $row['tenant_email'],
                'emergency_contact_name'     => $row['emergency_contact_name'],
                'emergency_contact_phone'    => $row['emergency_contact_phone'],
                'emergency_contact_relation' => $row['emergency_contact_relation'],
            ]
        );
        // tenant_code is auto-generated by Tenant::booted() hook on create.

        $result['tenant_created'] = ! $tenantExists;

        // 4. Create Tenancy.
        Tenancy::create([
            'tenant_id'        => $tenant->id,
            'unit_id'          => $unit->id,
            'move_in_date'     => $row['move_in_date'],
            // Decision #8: future dates allowed — no constraint applied here.
            'monthly_rent'     => (float) $row['monthly_rent'],
            // Decision #13: use !== null after normalisation, not isset()
            'security_deposit' => $row['security_deposit'] !== null ? (float) $row['security_deposit'] : 0.0,
            'rent_due_day'     => $row['rent_due_day'] !== null ? (int) $row['rent_due_day'] : 1,
            // Decision #14: same pattern
            'status'           => 'active',
        ]);

        // 5. Mark unit occupied.
        $unit->update(['status' => 'occupied']);

        // 6. Create User account for tenant if email is provided.
        // Decision #2: email is required to create a portal account.
        // If no email, tenant is imported without a portal account.
        // If an account with this email already exists, skip silently.
        if ($row['tenant_email'] !== null) {
            $userExists = User::where('email', $row['tenant_email'])->exists();

            if (! $userExists) {
                User::create([
                    'name'                 => $row['tenant_full_name'],
                    'email'                => $row['tenant_email'],
                    'password'             => Hash::make(Str::random(16)),
                    'role'                 => Role::Tenant,
                    'tenant_id'            => $tenant->id,
                    'must_change_password' => true,
                ]);
                $result['user_created'] = true;
            }
        }

        // Decisions #6 & #7: payment creation intentionally omitted.

        return $result;
    }
}
```

---

## 8. Policy

### File: `app/Policies/CsvImportBatchPolicy.php`

```php
<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\CsvImportBatch;
use App\Models\User;

class CsvImportBatchPolicy
{
    /**
     * Admins pass all gates unconditionally — consistent with every other policy.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === Role::Admin) {
            return true;
        }

        return null;
    }

    /**
     * Decision #12: viewAny gates the index page.
     * Only landlords can view the import history list.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    /**
     * A landlord can only view their own batch result page.
     */
    public function view(User $user, CsvImportBatch $batch): bool
    {
        return $user->id === $batch->user_id;
    }

    /**
     * Only landlords can create import batches.
     */
    public function create(User $user): bool
    {
        return $user->role === Role::Landlord;
    }

    /**
     * Decision #17: both admins and landlords may download the CSV template.
     * Admins pass via before(). This method covers landlords explicitly.
     */
    public function downloadTemplate(User $user): bool
    {
        return $user->role === Role::Landlord;
    }
}
```

**Registration:** In `app/Providers/AppServiceProvider.php` `boot()`:
```php
use App\Models\CsvImportBatch;
use App\Policies\CsvImportBatchPolicy;
use Illuminate\Support\Facades\Gate;

Gate::policy(CsvImportBatch::class, CsvImportBatchPolicy::class);
```

---

## 9. Notification

### File: `app/Notifications/CsvImportCompleted.php`

**Decision #16:** Database notification sent to the landlord and all admin users
after every import (regardless of whether all rows succeeded or some failed).

```php
<?php

namespace App\Notifications;

use App\Models\CsvImportBatch;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CsvImportCompleted extends Notification
{
    use Queueable;

    public function __construct(
        public readonly CsvImportBatch $batch,
        public readonly User $landlord,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        $isAdmin = $notifiable->role->value === 'admin';

        $message = $isAdmin
            ? "Landlord {$this->landlord->name} completed a bulk import of "
              ."\"{$this->batch->original_filename}\". "
              ."{$this->batch->created_rows} records created, "
              ."{$this->batch->failed_rows} failed."
            : "Your import of \"{$this->batch->original_filename}\" is complete. "
              ."{$this->batch->created_rows} records created"
              .($this->batch->failed_rows > 0
                  ? ", {$this->batch->failed_rows} rows could not be imported."
                  : '.');

        return [
            'title'       => 'Bulk Import Complete',
            'message'     => $message,
            'batch_id'    => $this->batch->id,
            'priority'    => 'normal',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
```

---

## 10. Controller

### File: `app/Http/Controllers/Web/Landlord/CsvImportController.php`

```php
<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\CsvImportConfirmRequest;
use App\Http\Requests\Landlord\CsvImportUploadRequest;
use App\Models\CsvImportBatch;
use App\Models\User;
use App\Notifications\CsvImportCompleted;
use App\Services\Landlord\CsvImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvImportController extends Controller
{
    public function __construct(protected CsvImportService $service) {}

    /**
     * GET /landlord/import
     * Show upload form and batch history.
     *
     * Decision #12: uses viewAny, not create.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CsvImportBatch::class);

        $batches = $this->service->getBatchHistory($request->user());

        return Inertia::render('landlord/import/index', [
            'batches' => $batches,
        ]);
    }

    /**
     * GET /landlord/import/template
     * Stream the CSV template for download.
     *
     * Decision #17: admins (via policy before()) and landlords are authorised.
     */
    public function template(Request $request): StreamedResponse
    {
        $this->authorize('downloadTemplate', CsvImportBatch::class);

        $path = storage_path('app/templates/tenant-import-template.csv');

        abort_unless(file_exists($path), 404, 'Template file not found.');

        return response()->streamDownload(function () use ($path) {
            readfile($path);
        }, 'tenant-import-template.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * POST /landlord/import/preview
     * Validate the CSV and return a dry-run preview.
     * Stores the file with a preview_token — no second upload needed later.
     *
     * Decision #4: file stored here, token returned in Inertia props.
     */
    public function preview(CsvImportUploadRequest $request): Response
    {
        $this->authorize('create', CsvImportBatch::class);

        $preview = $this->service->preview(
            $request->user(),
            $request->file('csv_file')
        );

        return Inertia::render('landlord/import/preview', [
            'preview' => $preview,
            // preview_token and original_filename are inside $preview already
        ]);
    }

    /**
     * POST /landlord/import
     * Execute the import using the stored preview file — no file re-upload.
     *
     * Decision #4: receives preview_token, loads file from Storage.
     * Decision #3: partial import — valid rows are committed, failed rows logged.
     * Decision #16: notifies landlord and all admins on completion.
     * Decision #18: UUID is already determined (used as token), batch created atomically.
     */
    public function store(CsvImportConfirmRequest $request): RedirectResponse
    {
        $this->authorize('create', CsvImportBatch::class);

        $landlord = $request->user();

        if (! $request->previewFileExists()) {
            return redirect()
                ->route('landlord.import.index')
                ->with('error', 'Your preview session has expired. Please re-upload your file.');
        }

        // Decision #18: UUID (preview_token) was determined during preview().
        // File already stored. Move it from the temp preview location to the permanent path.
        $token        = $request->input('preview_token');
        $tempPath     = 'csv-imports/preview/'.$token.'.csv';
        $permanentPath = 'csv-imports/'.$token.'/'.$request->input('original_filename');

        Storage::move($tempPath, $permanentPath);

        // Create batch record atomically with the stored path — stored_path is never null.
        // Decision #18: UUID and path written together in one create() call.
        $batch = CsvImportBatch::create([
            'user_id'           => $landlord->id,
            'original_filename' => $request->input('original_filename'),
            'stored_path'       => $permanentPath,
            'status'            => 'processing',
            'total_rows'        => 0, // set properly by service during import
        ]);

        // Run the import (partial — per-row transactions)
        $batch = $this->service->import($landlord, $batch);

        // Decision #16: notify the landlord via database notification
        $landlord->notify(new CsvImportCompleted($batch, $landlord));

        // Notify all admin users
        User::where('role', Role::Admin)->each(function (User $admin) use ($batch, $landlord) {
            $admin->notify(new CsvImportCompleted($batch, $landlord));
        });

        $message = $batch->failed_rows > 0
            ? "{$batch->created_rows} records imported. {$batch->failed_rows} rows had errors — review the report."
            : "Import complete. {$batch->created_rows} records created.";

        return redirect()
            ->route('landlord.import.show', $batch)
            ->with('success', $message);
    }

    /**
     * GET /landlord/import/{batch}
     * Show batch result detail.
     */
    public function show(Request $request, CsvImportBatch $batch): Response
    {
        $this->authorize('view', $batch);

        return Inertia::render('landlord/import/show', [
            'batch' => $batch,
        ]);
    }
}
```

---

## 11. Routes

### File: `routes/web.php` — additions and import

Add to the top-level imports:
```php
use App\Http\Controllers\Web\Landlord\CsvImportController;
```

Add inside `Route::middleware(['auth'])->group(...)`, after the existing
`landlord.tenants.*` routes and **before** the `tenant.*` block:

```php
// -------------------------------------------------------------------------
// CSV Bulk Import Routes
// ORDERING: static segments (template, preview) must precede {batch} wildcard.
// -------------------------------------------------------------------------
Route::get('/landlord/import', [CsvImportController::class, 'index'])
    ->name('landlord.import.index');

Route::get('/landlord/import/template', [CsvImportController::class, 'template'])
    ->name('landlord.import.template');

Route::post('/landlord/import/preview', [CsvImportController::class, 'preview'])
    ->name('landlord.import.preview')
    ->middleware('throttle:10,1');

Route::post('/landlord/import', [CsvImportController::class, 'store'])
    ->name('landlord.import.store')
    ->middleware('throttle:5,1');

// {batch} wildcard MUST be last to avoid swallowing 'template' and 'preview'
Route::get('/landlord/import/{batch}', [CsvImportController::class, 'show'])
    ->name('landlord.import.show');
```

---

## 12. Frontend

### 12.1 Shared TypeScript Interfaces

Define locally in each page file (no shared types file unless one already exists).

```typescript
interface CsvImportBatch {
    id: number;
    original_filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    total_rows: number;
    processed_rows: number;
    created_rows: number;
    failed_rows: number;
    row_errors: RowError[] | null;
    import_summary: ImportSummary | null;
    completed_at: string | null;
    created_at: string;
}

interface RowError {
    row: number;
    field: string;
    message: string;
}

interface ImportSummary {
    properties: number;
    units: number;
    tenants: number;
    tenancies: number;
    users: number;
}

interface CsvPreview {
    rows: Record<string, string>[];
    errors: RowError[];
    total_rows: number;
    valid_count: number;
    error_count: number;
    preview_token: string;       // Decision #4
    original_filename: string;   // Decision #4
}
```

---

### 12.2 Upload + History Page

### File: `resources/js/pages/landlord/import/index.tsx`

```typescript
interface Props {
    batches: {
        data: CsvImportBatch[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

// Layout wrapper — identical to create.tsx pattern
ImportIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
```

**Structure:**
- Page header: "Bulk Import" title, badge, description, "Back to Tenants" link
- Two-column section (`lg:grid-cols-2 gap-6`):
  - **Left — Upload card:** file dropzone, "Download Template" link, submit button
  - **Right — Instructions card:** column reference table, tips for date format, phone format
- Batch history table (below two columns)

**Upload card behaviour:**
- `useForm({ csv_file: null })` from `@inertiajs/react`
- Hidden `<input type="file" accept=".csv" />` triggered by styled dropzone
- On file select: display filename + file size
- Submit: `form.post(CsvImportController.preview().url(), { forceFormData: true })`
- Show `form.errors.csv_file` below input
- Disable submit while `form.processing`
- "Download Template" renders as `<a href={CsvImportController.template().url()} download>`

**Batch history table columns:** File | Date | Status (Badge) | Created / Total | Failed | Action (View link)

Status badge colours: `completed` = green, `failed` = red, `processing` = yellow, `pending` = grey, `cancelled` = grey.

Empty state: "No imports yet. Upload your first CSV to get started."

---

### 12.3 Preview Page

### File: `resources/js/pages/landlord/import/preview.tsx`

```typescript
interface Props {
    preview: CsvPreview;
}

PreviewPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
```

**Decision #3:** The Confirm button is enabled as long as `preview.valid_count > 0`,
regardless of whether there are errors. Partial import means the landlord can proceed
even if some rows have problems.

**Decision #4:** The Confirm form sends `preview_token` and `original_filename` — no file
input. Uses `useForm` with these two fields pre-populated from props.

```typescript
const form = useForm({
    preview_token: preview.preview_token,
    original_filename: preview.original_filename,
});

const confirm = () => {
    form.post(CsvImportController.store().url());
};
```

**Structure:**
- Header: "Review Import" title, back link to index
- Summary bar: `{total_rows} rows · {valid_count} valid · {error_count} with errors`
- Error panel (rendered when `error_count > 0`):
  - Warning banner: "X rows have errors and will be skipped during import."
  - Table: Row | Field | Error message
- Valid rows panel:
  - Table: Row | Property | Unit | Tenant | Phone | Move-in | Rent
  - "Show all / Collapse" toggle when > 20 rows
- Action bar:
  - "← Re-upload" link to index
  - "Import {valid_count} valid rows →" submit button (disabled when `valid_count === 0` or `form.processing`)

---

### 12.4 Batch Result Page

### File: `resources/js/pages/landlord/import/show.tsx`

```typescript
interface Props {
    batch: CsvImportBatch;
}

ShowPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
```

**Structure:**
- Header: "Import Report" title, back link to index
- Status banner:
  - `completed` with `failed_rows === 0`: green — "Import Successful"
  - `completed` with `failed_rows > 0`: yellow — "Import Completed with Errors"
  - `failed`: red — "Import Failed — No records were created"
- Summary cards (when `import_summary` present, rendered as 5-card responsive grid):
  Properties Created | Units Created | Tenants Created | Tenancies Created | Portal Accounts Created
- Error table (when `row_errors` present):
  Row | Field | Message
- Action footer:
  "Run Another Import →" link to index

---

### 12.5 Modify Tenants Index

### File: `resources/js/pages/landlord/tenants/index.tsx` — MODIFY

In the header section, alongside the existing "Add Tenant" button, add:

```tsx
import { CsvImportController } from '@/actions/Web/Landlord/CsvImportController';
import { Upload } from 'lucide-react';

// Inside the header action group:
<Link href={CsvImportController.index().url()}>
    <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
        <Upload className="w-4 h-4 mr-2" />
        Bulk Import
    </Button>
</Link>
```

`lucide-react` is already installed. `Upload` is available.

---

## 13. Tests

### 13.1 Feature Test

### File: `tests/Feature/Landlord/CsvImportTest.php`

```php
<?php

use App\Enums\CsvImportStatus;
use App\Models\CsvImportBatch;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Notifications\CsvImportCompleted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

/**
 * Build a complete valid CSV content string (17 columns, Decision #6/#7).
 *
 * @param  array<int, array<string, string|null>>  $rows
 */
function csvContent(array $rows): string
{
    $header = implode(',', [
        'property_name','property_address','property_city','property_state',
        'property_type','unit_code','unit_name','tenant_full_name','tenant_email',
        'tenant_phone','emergency_contact_name','emergency_contact_phone',
        'emergency_contact_relation','move_in_date','monthly_rent',
        'security_deposit','rent_due_day',
    ]);

    $lines = [$header];
    foreach ($rows as $row) {
        $lines[] = implode(',', array_map(fn ($v) => $v ?? '', $row));
    }

    return implode("\n", $lines);
}

/**
 * Default valid row values. Override any key via $overrides.
 *
 * @param  array<string, string|null>  $overrides
 * @return array<string, string|null>
 */
function validRow(array $overrides = []): array
{
    return array_merge([
        'property_name'              => 'Test Apartments',
        'property_address'           => '1 Test Street',
        'property_city'              => 'Nairobi',
        'property_state'             => 'Nairobi County',
        'property_type'              => 'apartment',
        'unit_code'                  => 'A1',
        'unit_name'                  => 'Unit A1',
        'tenant_full_name'           => 'Jane Doe',
        'tenant_email'               => 'jane@example.com',
        'tenant_phone'               => '0712345678',
        'emergency_contact_name'     => 'John Doe',
        'emergency_contact_phone'    => '0798765432',
        'emergency_contact_relation' => 'Spouse',
        'move_in_date'               => '2024-01-15',
        'monthly_rent'               => '25000',
        'security_deposit'           => '50000',
        'rent_due_day'               => '1',
    ], $overrides);
}

function makeCsvUpload(string $content, string $name = 'import.csv'): UploadedFile
{
    $tmp = tempnam(sys_get_temp_dir(), 'csv_test_');
    file_put_contents($tmp, $content);

    return new UploadedFile($tmp, $name, 'text/csv', null, true);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    Notification::fake();
    Storage::fake('local');
});

// ---------------------------------------------------------------------------
// Access Control
// ---------------------------------------------------------------------------

test('guest is redirected from import index', function () {
    get(route('landlord.import.index'))->assertRedirect(route('login'));
});

test('tenant role cannot access import index', function () {
    $tenant = User::factory()->create(['role' => 'tenant']);
    actingAs($tenant)->get(route('landlord.import.index'))->assertForbidden();
});

test('landlord can view import index', function () {
    actingAs($this->landlord)
        ->get(route('landlord.import.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/import/index')->has('batches'));
});

// ---------------------------------------------------------------------------
// Template Download
// ---------------------------------------------------------------------------

test('landlord can download the CSV template', function () {
    Storage::disk('local')->put('templates/tenant-import-template.csv', 'property_name,unit_code');

    actingAs($this->landlord)
        ->get(route('landlord.import.template'))
        ->assertSuccessful()
        ->assertHeader('Content-Type', 'text/csv');
});

test('admin can download the CSV template', function () {
    Storage::disk('local')->put('templates/tenant-import-template.csv', 'property_name,unit_code');

    $admin = User::factory()->create(['role' => 'admin']);
    actingAs($admin)
        ->get(route('landlord.import.template'))
        ->assertSuccessful();
});

test('tenant cannot download the CSV template', function () {
    $tenant = User::factory()->create(['role' => 'tenant']);
    actingAs($tenant)
        ->get(route('landlord.import.template'))
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

test('preview with valid CSV returns row data, zero errors, and a preview_token', function () {
    $file = makeCsvUpload(csvContent([validRow()]));

    actingAs($this->landlord)
        ->post(route('landlord.import.preview'), ['csv_file' => $file])
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('landlord/import/preview')
            ->where('preview.error_count', 0)
            ->where('preview.total_rows', 1)
            ->has('preview.preview_token')     // Decision #4
            ->has('preview.original_filename')  // Decision #4
        );
});

test('preview accepts future move_in_date', function () {
    // Decision #8: future dates must be allowed
    $file = makeCsvUpload(csvContent([validRow(['move_in_date' => '2030-01-01'])]));

    actingAs($this->landlord)
        ->post(route('landlord.import.preview'), ['csv_file' => $file])
        ->assertInertia(fn ($page) => $page->where('preview.error_count', 0));
});

test('preview flags a missing required field', function () {
    $file = makeCsvUpload(csvContent([validRow(['tenant_phone' => null])]));

    actingAs($this->landlord)
        ->post(route('landlord.import.preview'), ['csv_file' => $file])
        ->assertInertia(fn ($page) => $page
            ->where('preview.error_count', 1)
        );
});

test('preview flags duplicate unit_code within the file', function () {
    $file = makeCsvUpload(csvContent([
        validRow(['unit_code' => 'A1']),
        validRow(['unit_code' => 'A1', 'tenant_phone' => '0799999999', 'tenant_email' => 'other@example.com']),
    ]));

    actingAs($this->landlord)
        ->post(route('landlord.import.preview'), ['csv_file' => $file])
        ->assertInertia(fn ($page) => $page->where('preview.error_count', 1));
});

test('preview flags unit that already has an active tenancy', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id, 'name' => 'Test Apartments']);
    $unit     = Unit::factory()->create(['property_id' => $property->id, 'unit_code' => 'A1', 'status' => 'occupied']);
    Tenancy::factory()->create(['unit_id' => $unit->id, 'status' => 'active']);

    $file = makeCsvUpload(csvContent([validRow(['unit_code' => 'A1'])]));

    actingAs($this->landlord)
        ->post(route('landlord.import.preview'), ['csv_file' => $file])
        ->assertInertia(fn ($page) => $page->where('preview.error_count', 1));
});

test('preview rejects non-CSV file', function () {
    $file = UploadedFile::fake()->create('import.pdf', 100, 'application/pdf');

    actingAs($this->landlord)
        ->post(route('landlord.import.preview'), ['csv_file' => $file])
        ->assertSessionHasErrors('csv_file');
});

// ---------------------------------------------------------------------------
// Import (store) — Decision #4: uses preview_token, no re-upload
// ---------------------------------------------------------------------------

test('store without a valid preview_token redirects with error', function () {
    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token'     => 'non-existent-token',
            'original_filename' => 'import.csv',
        ])
        ->assertRedirect(route('landlord.import.index'));
});

test('valid import creates property, unit, tenant, tenancy, and user account', function () {
    // Simulate preview step storing the file
    $token   = \Illuminate\Support\Str::uuid()->toString();
    $content = csvContent([validRow()]);
    Storage::put('csv-imports/preview/'.$token.'.csv', $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token'     => $token,
            'original_filename' => 'import.csv',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('properties', ['name' => 'Test Apartments', 'owner_id' => $this->landlord->id]);
    $this->assertDatabaseHas('units', ['unit_code' => 'A1']);
    $this->assertDatabaseHas('tenants', ['full_name' => 'Jane Doe']);
    $this->assertDatabaseHas('tenancies', ['monthly_rent' => 25000, 'status' => 'active']);
    // Decision #2: user account created when email present
    $this->assertDatabaseHas('users', ['email' => 'jane@example.com', 'must_change_password' => true]);
    $this->assertDatabaseHas('csv_import_batches', ['user_id' => $this->landlord->id, 'status' => 'completed']);
});

test('tenant without email is imported without a user account', function () {
    $token   = \Illuminate\Support\Str::uuid()->toString();
    $content = csvContent([validRow(['tenant_email' => null])]);
    Storage::put('csv-imports/preview/'.$token.'.csv', $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token'     => $token,
            'original_filename' => 'import.csv',
        ]);

    $this->assertDatabaseHas('tenants', ['full_name' => 'Jane Doe']);
    // No user account when email is absent
    $this->assertDatabaseCount('users', 1); // only the landlord
});

test('import with future move_in_date succeeds', function () {
    // Decision #8
    $token   = \Illuminate\Support\Str::uuid()->toString();
    $content = csvContent([validRow(['move_in_date' => '2030-06-01'])]);
    Storage::put('csv-imports/preview/'.$token.'.csv', $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token'     => $token,
            'original_filename' => 'import.csv',
        ]);

    $this->assertDatabaseHas('tenancies', ['move_in_date' => '2030-06-01']);
});

test('partial import: valid rows succeed while invalid rows are skipped', function () {
    // Decision #3: partial import
    $token   = \Illuminate\Support\Str::uuid()->toString();
    $content = csvContent([
        validRow(['unit_code' => 'A1']),
        validRow(['unit_code' => 'A2', 'tenant_phone' => 'INVALID']),  // validation fail
        validRow(['unit_code' => 'A3', 'tenant_phone' => '0733333333', 'tenant_email' => 'c@example.com']),
    ]);
    Storage::put('csv-imports/preview/'.$token.'.csv', $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token'     => $token,
            'original_filename' => 'import.csv',
        ]);

    $batch = CsvImportBatch::first();
    expect($batch->created_rows)->toBe(2)
        ->and($batch->failed_rows)->toBe(1)
        ->and($batch->status)->toBe(CsvImportStatus::Completed);

    $this->assertDatabaseHas('units', ['unit_code' => 'A1']);
    $this->assertDatabaseHas('units', ['unit_code' => 'A3']);
    $this->assertDatabaseMissing('units', ['unit_code' => 'A2']);
});

test('import notifies landlord and all admins', function () {
    // Decision #16
    $admin = User::factory()->create(['role' => 'admin']);

    $token   = \Illuminate\Support\Str::uuid()->toString();
    $content = csvContent([validRow()]);
    Storage::put('csv-imports/preview/'.$token.'.csv', $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token'     => $token,
            'original_filename' => 'import.csv',
        ]);

    Notification::assertSentTo($this->landlord, CsvImportCompleted::class);
    Notification::assertSentTo($admin, CsvImportCompleted::class);
});

test('import reuses existing property when name matches', function () {
    Property::factory()->create(['owner_id' => $this->landlord->id, 'name' => 'Test Apartments']);

    $token   = \Illuminate\Support\Str::uuid()->toString();
    $content = csvContent([validRow()]);
    Storage::put('csv-imports/preview/'.$token.'.csv', $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token'     => $token,
            'original_filename' => 'import.csv',
        ]);

    $this->assertDatabaseCount('properties', 1);
});

// ---------------------------------------------------------------------------
// Show (Batch Detail)
// ---------------------------------------------------------------------------

test('landlord can view their own batch result', function () {
    $batch = CsvImportBatch::factory()->completed()->create(['user_id' => $this->landlord->id]);

    actingAs($this->landlord)
        ->get(route('landlord.import.show', $batch))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/import/show'));
});

test('landlord cannot view another landlord batch', function () {
    $other = User::factory()->create(['role' => 'landlord']);
    $batch = CsvImportBatch::factory()->completed()->create(['user_id' => $other->id]);

    actingAs($this->landlord)
        ->get(route('landlord.import.show', $batch))
        ->assertForbidden();
});

test('batch history appears on index after import', function () {
    CsvImportBatch::factory()->completed()->create(['user_id' => $this->landlord->id]);

    actingAs($this->landlord)
        ->get(route('landlord.import.index'))
        ->assertInertia(fn ($page) => $page->has('batches.data', 1));
});
```

---

### 13.2 Service Test

### File: `tests/Feature/Services/CsvImportServiceTest.php`

```php
<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Services\Landlord\CsvImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->service  = app(CsvImportService::class);
});

function svcCsvUpload(array $rows): UploadedFile
{
    $header = implode(',', [
        'property_name','property_address','property_city','property_state',
        'property_type','unit_code','unit_name','tenant_full_name','tenant_email',
        'tenant_phone','emergency_contact_name','emergency_contact_phone',
        'emergency_contact_relation','move_in_date','monthly_rent',
        'security_deposit','rent_due_day',
    ]);
    $lines = [$header];
    foreach ($rows as $row) {
        $lines[] = implode(',', array_map(fn ($v) => $v ?? '', $row));
    }
    $content = implode("\n", $lines);
    $tmp     = tempnam(sys_get_temp_dir(), 'svc_csv_');
    file_put_contents($tmp, $content);

    return new UploadedFile($tmp, 'test.csv', 'text/csv', null, true);
}

function svcRow(array $overrides = []): array
{
    return array_merge([
        'Test Apts','1 Main St','Nairobi','','apartment',
        'B1','Unit B1','Alice K','alice@test.com','0700111222',
        'Bob K','0700333444','Parent',
        '2023-06-01','15000','30000','1',
    ], array_values($overrides));
}

it('preview returns zero errors for a valid row', function () {
    $file   = svcCsvUpload([svcRow()]);
    $result = $this->service->preview($this->landlord, $file);

    expect($result['error_count'])->toBe(0)
        ->and($result['total_rows'])->toBe(1)
        ->and($result['preview_token'])->toBeString()     // Decision #4
        ->and($result['original_filename'])->toBe('test.csv');
});

it('preview accepts a future move_in_date', function () {
    // Decision #8
    $row = svcRow();
    $row[13] = '2035-01-01'; // move_in_date index
    $result = $this->service->preview($this->landlord, svcCsvUpload([$row]));

    expect($result['error_count'])->toBe(0);
});

it('preview catches a missing required field', function () {
    $row    = svcRow();
    $row[9] = ''; // tenant_phone empty
    $result = $this->service->preview($this->landlord, svcCsvUpload([$row]));

    expect($result['error_count'])->toBe(1);
    $fields = array_column($result['errors'], 'field');
    expect(in_array('tenant_phone', $fields))->toBeTrue();
});

it('preview flags duplicate unit_code within the file', function () {
    $rowA = svcRow();
    $rowB = svcRow();
    $rowB[5]  = 'B1';         // same unit_code
    $rowB[9]  = '0799999999'; // different phone
    $rowB[8]  = 'other@test.com';

    $result = $this->service->preview($this->landlord, svcCsvUpload([$rowA, $rowB]));

    $unitErrors = array_filter($result['errors'], fn ($e) => $e['field'] === 'unit_code');
    expect(count($unitErrors))->toBeGreaterThanOrEqual(1);
});

it('preview flags occupied unit from DB', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id, 'name' => 'Test Apts']);
    $unit     = Unit::factory()->create(['property_id' => $property->id, 'unit_code' => 'B1', 'status' => 'occupied']);
    Tenancy::factory()->create(['unit_id' => $unit->id, 'status' => 'active']);

    $result = $this->service->preview($this->landlord, svcCsvUpload([svcRow()]));

    $unitErrors = array_filter($result['errors'], fn ($e) => $e['field'] === 'unit_code');
    expect(count($unitErrors))->toBe(1);
});

it('getBatchHistory returns only batches belonging to the requesting landlord', function () {
    $other = User::factory()->create(['role' => 'landlord']);

    \App\Models\CsvImportBatch::factory()->create(['user_id' => $this->landlord->id]);
    \App\Models\CsvImportBatch::factory()->create(['user_id' => $other->id]);

    $result = $this->service->getBatchHistory($this->landlord);

    expect($result->total())->toBe(1);
});
```

---

## 14. Execution Order

Follow exactly. Do not skip or reorder steps.

| Step | Action | Verify |
|------|--------|--------|
| 1 | Create `app/Enums/CsvImportStatus.php` | No syntax errors |
| 2 | Run migration artisan command, write migration body, run `php artisan migrate` | Table `csv_import_batches` exists with `deleted_at` column |
| 3 | Create `CsvImportBatch` model (with `SoftDeletes`) | `php artisan tinker --execute 'new App\Models\CsvImportBatch;'` succeeds |
| 4 | Create `CsvImportBatchFactory` | Factory instantiates all 3 states |
| 5 | Create template file at `storage/app/templates/tenant-import-template.csv` | 17 columns, 2 example rows |
| 6 | Create `CsvImportUploadRequest` | Extends FormRequest (ArchTest) |
| 7 | Create `CsvImportConfirmRequest` | Extends FormRequest (ArchTest) |
| 8 | Create `CsvImportService` | `app(CsvImportService::class)` resolves |
| 9 | Create `CsvImportCompleted` notification | `via()` returns `['database']` |
| 10 | Create `CsvImportBatchPolicy`, register in `AppServiceProvider::boot()` | `Gate::getPolicyFor(CsvImportBatch::class)` not null |
| 11 | Create `CsvImportController` | DI resolves service |
| 12 | Add routes to `web.php`, add import at top | `php artisan route:list --name=landlord.import` shows 5 routes |
| 13 | Run `php artisan wayfinder:generate` | `resources/js/actions/Web/Landlord/CsvImportController.ts` exists |
| 14 | Create `resources/js/pages/landlord/import/index.tsx` | No TS errors |
| 15 | Create `resources/js/pages/landlord/import/preview.tsx` | No TS errors |
| 16 | Create `resources/js/pages/landlord/import/show.tsx` | No TS errors |
| 17 | Modify `resources/js/pages/landlord/tenants/index.tsx` | "Bulk Import" button renders |
| 18 | Create `tests/Feature/Landlord/CsvImportTest.php` | File has `uses(RefreshDatabase::class)` |
| 19 | Create `tests/Feature/Services/CsvImportServiceTest.php` | File has `uses(RefreshDatabase::class)` |
| 20 | Run `vendor/bin/pint --dirty --format agent` | Zero formatting changes |
| 21 | Run `php artisan test --compact --filter=CsvImport` | All new tests pass |
| 22 | Run `php artisan test --compact` | Full suite green (484+ tests) |

---

## 15. Remaining Edge Cases

| Case | Handling |
|------|---------|
| Property name match is case-insensitive | `LOWER(name) = LOWER(?)` in both validation and importRow |
| Tenant phone dedup | `updateOrCreate(['phone' => ...])` — one phone = one person (Decision #1) |
| Tenant email already used by existing user | `User::where('email', ...)->exists()` guard — skip user creation silently |
| `property_type` blank | Defaults to `'apartment'` — matches PropertyFactory (Decision #5) |
| `security_deposit` blank | `$row['security_deposit'] !== null ? float : 0.0` (Decision #13) |
| `rent_due_day` blank | `$row['rent_due_day'] !== null ? int : 1` (Decision #14) |
| CSV with Windows line endings (`\r\n`) | `SplFileObject::DROP_NEW_LINE` strips `\n`; `trim()` strips `\r` |
| CSV with UTF-8 BOM from Excel | `ltrim($headers[0], "\xEF\xBB\xBF")` in parseCsv (Decision #15) |
| Preview token expired (file cleaned up) | `store()` checks `Storage::exists()` and redirects with error message |
| Multiple rows, same tenant phone | Row 2 hits `updateOrCreate` match — updates the tenant; creates a new tenancy. Counts as `tenant_created = false` |
| Future move-in date | Accepted — no `before_or_equal:today` constraint (Decision #8) |
| No portal account for tenant | Only created when `tenant_email !== null` (Decision #2) |
| Partial import batch status | Always `completed` even when some rows failed. Use `failed_rows > 0` to distinguish full success from partial |
| Payment records | Not implemented in v1 (Decisions #6 & #7) |
| Storage disk | Default `local` disk (`storage/app/`). All paths relative to `storage/app/` |
| Template file not in git | User will update `.gitignore` to un-ignore `storage/app/templates/` (Decision #11) |
