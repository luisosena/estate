<?php

use App\Enums\CsvImportStatus;
use App\Models\CsvImportBatch;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use App\Notifications\CsvImportCompleted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

/**
 * Build a complete valid CSV content string (17 columns, Decision #6/#7).
 *
 * @param  array<int, array<string, string|null>>  $rows
 */
function csvContent(array $rows): string
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
        'property_name' => 'Test Apartments',
        'property_address' => '1 Test Street',
        'property_city' => 'Nairobi',
        'property_state' => 'Nairobi County',
        'property_type' => 'apartment',
        'unit_code' => 'A1',
        'unit_name' => 'Unit A1',
        'tenant_full_name' => 'Jane Doe',
        'tenant_email' => 'jane@example.com',
        'tenant_phone' => '0712345678',
        'emergency_contact_name' => 'John Doe',
        'emergency_contact_phone' => '0798765432',
        'emergency_contact_relation' => 'Spouse',
        'move_in_date' => '2024-01-15',
        'monthly_rent' => '25000',
        'security_deposit' => '50000',
        'rent_due_day' => '1',
    ], $overrides);
}

function makeCsvUpload(string $content, string $name = 'import.csv'): UploadedFile
{
    $tmp = tempnam(sys_get_temp_dir(), 'csv_test_');
    file_put_contents($tmp, $content);

    return new UploadedFile($tmp, $name, 'text/csv', null, true);
}

/**
 * Write a preview CSV via the Storage facade so that Storage::exists() and
 * Storage::move() in the controller can find it using the same disk driver.
 * Using Storage::put() eliminates any path-resolution discrepancy on Windows.
 */
function writePreviewFile(string $token, string $content): void
{
    Storage::put('csv-imports/preview/'.$token.'.csv', $content);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    Notification::fake();
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
    actingAs($this->landlord)
        ->get(route('landlord.import.template'))
        ->assertSuccessful()
        ->assertHeaderContains('Content-Type', 'text/csv');
});

test('admin can download the CSV template', function () {
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
            ->has('preview.preview_token')
            ->has('preview.original_filename')
        );
});

test('preview accepts future move_in_date', function () {
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
    $unit = Unit::factory()->create(['property_id' => $property->id, 'unit_code' => 'A1', 'status' => 'occupied']);
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
    $fakeUuid = Str::uuid()->toString();

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token' => $fakeUuid,
            'original_filename' => 'import.csv',
        ])
        ->assertRedirect(route('landlord.import.index'));
});

test('valid import creates property, unit, tenant, tenancy, and user account', function () {
    $token = Str::uuid()->toString();
    $content = csvContent([validRow()]);
    writePreviewFile($token, $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token' => $token,
            'original_filename' => 'import.csv',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('properties', ['name' => 'Test Apartments', 'owner_id' => $this->landlord->id]);
    $this->assertDatabaseHas('units', ['unit_code' => 'A1']);
    $this->assertDatabaseHas('tenants', ['full_name' => 'Jane Doe']);
    $this->assertDatabaseHas('tenancies', ['monthly_rent' => 25000, 'status' => 'active']);
    $this->assertDatabaseHas('users', ['email' => 'jane@example.com', 'must_change_password' => true]);
    $this->assertDatabaseHas('csv_import_batches', ['user_id' => $this->landlord->id, 'status' => 'completed']);
});

test('tenant without email is imported without a user account', function () {
    $token = Str::uuid()->toString();
    $content = csvContent([validRow(['tenant_email' => null])]);
    writePreviewFile($token, $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token' => $token,
            'original_filename' => 'import.csv',
        ]);

    $this->assertDatabaseHas('tenants', ['full_name' => 'Jane Doe']);
    $this->assertDatabaseCount('users', 1);
});

test('import with future move_in_date succeeds', function () {
    $token = Str::uuid()->toString();
    $content = csvContent([validRow(['move_in_date' => '2030-06-01'])]);
    writePreviewFile($token, $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token' => $token,
            'original_filename' => 'import.csv',
        ]);

    expect(Tenancy::first()->move_in_date->format('Y-m-d'))->toBe('2030-06-01');
});

test('partial import: valid rows succeed while invalid rows are skipped', function () {
    $token = Str::uuid()->toString();
    $content = csvContent([
        validRow(['unit_code' => 'A1']),
        validRow(['unit_code' => 'A2', 'tenant_phone' => 'INVALID']),
        validRow(['unit_code' => 'A3', 'tenant_phone' => '0733333333', 'tenant_email' => 'c@example.com']),
    ]);
    writePreviewFile($token, $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token' => $token,
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
    $admin = User::factory()->create(['role' => 'admin']);

    $token = Str::uuid()->toString();
    $content = csvContent([validRow()]);
    writePreviewFile($token, $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token' => $token,
            'original_filename' => 'import.csv',
        ]);

    Notification::assertSentTo($this->landlord, CsvImportCompleted::class);
    Notification::assertSentTo($admin, CsvImportCompleted::class);
});

test('import reuses existing property when name matches', function () {
    Property::factory()->create(['owner_id' => $this->landlord->id, 'name' => 'Test Apartments']);

    $token = Str::uuid()->toString();
    $content = csvContent([validRow()]);
    writePreviewFile($token, $content);

    actingAs($this->landlord)
        ->post(route('landlord.import.store'), [
            'preview_token' => $token,
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
