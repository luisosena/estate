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
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CsvImportService
{
    /**
     * Parse and validate a CSV file without persisting anything.
     * Also persists the file to temporary storage and returns a preview_token.
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
    public function preview(User $landlord, UploadedFile $file): array
    {
        $token = Str::uuid()->toString();
        $tempPath = 'csv-imports/preview/'.$token.'.csv';
        Storage::put($tempPath, file_get_contents($file->getRealPath()));

        $rows = $this->parseCsv(Storage::path($tempPath));
        $errors = $this->validateRows($rows, $landlord);

        $errorRowNumbers = array_unique(array_column($errors, 'row'));

        return [
            'rows' => $rows,
            'errors' => $errors,
            'total_rows' => count($rows),
            'valid_count' => count($rows) - count($errorRowNumbers),
            'error_count' => count($errorRowNumbers),
            'preview_token' => $token,
            'original_filename' => $file->getClientOriginalName(),
        ];
    }

    /**
     * Execute the import for all rows that pass validation.
     * Rows that fail validation or encounter a runtime error are skipped and
     * recorded in row_errors. Valid rows are committed individually.
     *
     * @return CsvImportBatch The updated batch after import completes.
     */
    public function import(User $landlord, CsvImportBatch $batch): CsvImportBatch
    {
        $rows = $this->parseCsv(Storage::path($batch->stored_path));
        $errors = $this->validateRows($rows, $landlord);

        $failedRowNumbers = [];
        foreach ($errors as $error) {
            $failedRowNumbers[$error['row']] = true;
        }

        $summary = [
            'properties' => 0,
            'units' => 0,
            'tenants' => 0,
            'tenancies' => 0,
            'users' => 0,
        ];

        $processedRows = 0;
        $createdRows = 0;
        $failedRows = count($failedRowNumbers);

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1;
            $processedRows++;

            if (isset($failedRowNumbers[$rowNumber])) {
                continue;
            }

            try {
                $result = DB::transaction(function () use ($row, $landlord) {
                    return $this->importRow($row, $landlord);
                });

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
                $errors[] = [
                    'row' => $rowNumber,
                    'field' => 'import',
                    'message' => 'Row could not be imported: '.$e->getMessage(),
                ];
                $failedRows++;
            }
        }

        $batch->update([
            'status' => CsvImportStatus::Completed,
            'processed_rows' => $processedRows,
            'created_rows' => $createdRows,
            'failed_rows' => $failedRows,
            'row_errors' => empty($errors) ? null : $errors,
            'import_summary' => $summary,
            'completed_at' => now(),
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

    /**
     * Parse a CSV file at the given absolute path into an array of associative rows.
     * Header row is excluded from output. All values are trimmed.
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
        $rows = [];

        foreach ($file as $line) {
            if ($headers === null) {
                $trimmed = array_map('trim', $line);
                $trimmed[0] = ltrim($trimmed[0], "\xEF\xBB\xBF");
                $headers = $trimmed;

                continue;
            }

            if (empty(array_filter($line, fn ($v) => trim((string) $v) !== ''))) {
                continue;
            }

            $padded = array_pad(
                array_slice($line, 0, count($headers)),
                count($headers),
                ''
            );

            $rows[] = array_map('trim', array_combine($headers, $padded));
        }

        return $rows;
    }

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

        $seenUnitKeys = [];

        $occupiedUnitKeys = $this->loadOccupiedUnitKeys($landlord);

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1;
            $rowErrors = $this->validateRow($row, $rowNumber);

            $unitKey = strtolower(trim($row['property_name'] ?? ''))
                .'::'.strtolower(trim($row['unit_code'] ?? ''));

            if (! empty($row['unit_code']) && isset($seenUnitKeys[$unitKey])) {
                $rowErrors[] = [
                    'row' => $rowNumber,
                    'field' => 'unit_code',
                    'message' => "Unit code '{$row['unit_code']}' appears more than once "
                        ."for property '{$row['property_name']}' in this file.",
                ];
            } else {
                $seenUnitKeys[$unitKey] = $rowNumber;
            }

            if (! empty($row['property_name'])
                && ! empty($row['unit_code'])
                && isset($occupiedUnitKeys[$unitKey])
            ) {
                $rowErrors[] = [
                    'row' => $rowNumber,
                    'field' => 'unit_code',
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
            'property_name' => ['required', 'string', 'max:255'],
            'property_address' => ['required', 'string', 'max:255'],
            'property_city' => ['required', 'string', 'max:100'],
            'property_state' => ['nullable', 'string', 'max:100'],
            'property_type' => ['nullable', Rule::in(['apartment', 'house', 'commercial', 'mixed'])],
            'unit_code' => ['required', 'string', 'max:50'],
            'unit_name' => ['required', 'string', 'max:255'],
            'tenant_full_name' => ['required', 'string', 'max:255'],
            'tenant_email' => ['nullable', 'email', 'max:255'],
            'tenant_phone' => ['required', 'string', 'max:20', 'regex:'.$phoneRegex],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_phone' => ['required', 'string', 'max:20', 'regex:'.$phoneRegex],
            'emergency_contact_relation' => ['required', 'string', 'max:100'],
            'move_in_date' => ['required', 'date_format:Y-m-d'],
            'monthly_rent' => ['required', 'numeric', 'min:1'],
            'security_deposit' => ['nullable', 'numeric', 'min:0'],
            'rent_due_day' => ['nullable', 'integer', 'min:1', 'max:28'],
        ];

        $data = array_map(fn ($v) => $v === '' ? null : $v, $row);

        $validator = Validator::make($data, $rules);

        if ($validator->passes()) {
            return [];
        }

        $errors = [];
        foreach ($validator->errors()->toArray() as $field => $messages) {
            $errors[] = [
                'row' => $rowNumber,
                'field' => $field,
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
            $key = strtolower($row->property_name).'::'.strtolower($row->unit_code);
            $map[$key] = true;
        }

        return $map;
    }

    /**
     * Import a single validated row.
     * MUST be called inside DB::transaction() — each call is its own transaction
     * boundary managed by the caller in import().
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
        $row = array_map(fn ($v) => $v === '' ? null : $v, $row);

        $result = [
            'property_created' => false,
            'unit_created' => false,
            'tenant_created' => false,
            'user_created' => false,
        ];

        $property = Property::where('owner_id', $landlord->id)
            ->whereRaw('LOWER(name) = ?', [strtolower($row['property_name'])])
            ->first();

        if (! $property) {
            $property = Property::create([
                'owner_id' => $landlord->id,
                'name' => $row['property_name'],
                'address' => $row['property_address'],
                'city' => $row['property_city'],
                'state' => $row['property_state'],
                'property_type' => $row['property_type'] ?? 'apartment',
                'status' => 'active',
                'total_units' => 0,
            ]);
            $result['property_created'] = true;
        }

        $unit = Unit::where('property_id', $property->id)
            ->whereRaw('LOWER(unit_code) = ?', [strtolower($row['unit_code'])])
            ->first();

        if (! $unit) {
            $unit = Unit::create([
                'property_id' => $property->id,
                'unit_code' => $row['unit_code'],
                'unit_name' => $row['unit_name'],
                'status' => 'available',
            ]);
            $property->increment('total_units');
            $result['unit_created'] = true;
        }

        $tenantExists = Tenant::where('phone', $row['tenant_phone'])->exists();

        $tenant = Tenant::updateOrCreate(
            ['phone' => $row['tenant_phone']],
            [
                'full_name' => $row['tenant_full_name'],
                'email' => $row['tenant_email'],
                'emergency_contact_name' => $row['emergency_contact_name'],
                'emergency_contact_phone' => $row['emergency_contact_phone'],
                'emergency_contact_relation' => $row['emergency_contact_relation'],
            ]
        );

        $result['tenant_created'] = ! $tenantExists;

        Tenancy::create([
            'tenant_id' => $tenant->id,
            'unit_id' => $unit->id,
            'move_in_date' => $row['move_in_date'],
            'monthly_rent' => (float) $row['monthly_rent'],
            'security_deposit' => $row['security_deposit'] !== null ? (float) $row['security_deposit'] : 0.0,
            'rent_due_day' => $row['rent_due_day'] !== null ? (int) $row['rent_due_day'] : 1,
            'status' => 'active',
        ]);

        $unit->update(['status' => 'occupied']);

        if ($row['tenant_email'] !== null) {
            $userExists = User::where('email', $row['tenant_email'])->exists();

            if (! $userExists) {
                User::create([
                    'name' => $row['tenant_full_name'],
                    'username' => $this->generateUniqueUsername($row['tenant_full_name']),
                    'email' => $row['tenant_email'],
                    'password' => Hash::make(Str::random(16)),
                    'role' => Role::Tenant,
                    'tenant_id' => $tenant->id,
                    'must_change_password' => true,
                ]);
                $result['user_created'] = true;
            }
        }

        return $result;
    }

    /**
     * Generate a unique username based on the tenant's full name.
     */
    protected function generateUniqueUsername(string $fullName): string
    {
        do {
            $nameParts = explode(' ', trim($fullName));
            $base = strtolower(implode('.', array_slice($nameParts, 0, 3)));
            $username = $base.rand(100, 999);
        } while (User::where('username', $username)->exists());

        return $username;
    }
}
