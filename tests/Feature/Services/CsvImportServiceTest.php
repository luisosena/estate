<?php

use App\Models\CsvImportBatch;
use App\Models\Property;
use App\Models\Tenancy;
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
    $this->service = app(CsvImportService::class);
});

function svcCsvUpload(array $rows): UploadedFile
{
    $header = implode(',', [
        'property_name', 'property_address', 'property_city', 'property_state',
        'property_type', 'unit_code', 'unit_name', 'tenant_full_name', 'tenant_email',
        'tenant_phone', 'emergency_contact_name', 'emergency_contact_phone',
        'emergency_contact_relation', 'move_in_date', 'monthly_rent',
        'security_deposit', 'rent_due_day',
    ]);
    $lines = [$header];
    foreach ($rows as $row) {
        $lines[] = implode(',', array_map(fn ($v) => $v ?? '', $row));
    }
    $content = implode("\n", $lines);
    $tmp = tempnam(sys_get_temp_dir(), 'svc_csv_');
    file_put_contents($tmp, $content);

    return new UploadedFile($tmp, 'test.csv', 'text/csv', null, true);
}

function svcRow(array $overrides = []): array
{
    return array_merge([
        'Test Apts', '1 Main St', 'Nairobi', '', 'apartment',
        'B1', 'Unit B1', 'Alice K', 'alice@test.com', '0700111222',
        'Bob K', '0700333444', 'Parent',
        '2023-06-01', '15000', '30000', '1',
    ], array_values($overrides));
}

it('preview returns zero errors for a valid row', function () {
    $file = svcCsvUpload([svcRow()]);
    $result = $this->service->preview($this->landlord, $file);

    expect($result['error_count'])->toBe(0)
        ->and($result['total_rows'])->toBe(1)
        ->and($result['preview_token'])->toBeString()
        ->and($result['original_filename'])->toBe('test.csv');
});

it('preview accepts a future move_in_date', function () {
    $row = svcRow();
    $row[13] = '2035-01-01';
    $result = $this->service->preview($this->landlord, svcCsvUpload([$row]));

    expect($result['error_count'])->toBe(0);
});

it('preview catches a missing required field', function () {
    $row = svcRow();
    $row[9] = '';
    $result = $this->service->preview($this->landlord, svcCsvUpload([$row]));

    expect($result['error_count'])->toBe(1);
    $fields = array_column($result['errors'], 'field');
    expect(in_array('tenant_phone', $fields))->toBeTrue();
});

it('preview flags duplicate unit_code within the file', function () {
    $rowA = svcRow();
    $rowB = svcRow();
    $rowB[5] = 'B1';
    $rowB[9] = '0799999999';
    $rowB[8] = 'other@test.com';

    $result = $this->service->preview($this->landlord, svcCsvUpload([$rowA, $rowB]));

    $unitErrors = array_filter($result['errors'], fn ($e) => $e['field'] === 'unit_code');
    expect(count($unitErrors))->toBeGreaterThanOrEqual(1);
});

it('preview flags occupied unit from DB', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id, 'name' => 'Test Apts']);
    $unit = Unit::factory()->create(['property_id' => $property->id, 'unit_code' => 'B1', 'status' => 'occupied']);
    Tenancy::factory()->create(['unit_id' => $unit->id, 'status' => 'active']);

    $result = $this->service->preview($this->landlord, svcCsvUpload([svcRow()]));

    $unitErrors = array_filter($result['errors'], fn ($e) => $e['field'] === 'unit_code');
    expect(count($unitErrors))->toBe(1);
});

it('getBatchHistory returns only batches belonging to the requesting landlord', function () {
    $other = User::factory()->create(['role' => 'landlord']);

    CsvImportBatch::factory()->create(['user_id' => $this->landlord->id]);
    CsvImportBatch::factory()->create(['user_id' => $other->id]);

    $result = $this->service->getBatchHistory($this->landlord);

    expect($result->total())->toBe(1);
});
