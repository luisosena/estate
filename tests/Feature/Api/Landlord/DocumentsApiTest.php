<?php

use App\Models\Document;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();

    $this->tenant = Tenant::factory()->create();
    $this->unit->update(['status' => 'occupied']);
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
        'monthly_rent' => 15000,
    ]);

    Storage::fake('documents');
});

test('landlord can list documents for a tenancy', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');
    Document::create([
        'user_id' => $this->landlord->id,
        'documentable_type' => Tenancy::class,
        'documentable_id' => $this->tenancy->id,
        'file_path' => 'tenancy_agreement/Tenancy/1/test.pdf',
        'file_name' => 'agreement.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    $this->actingAs($this->landlord, 'sanctum')
        ->getJson("/api/v1/landlord/tenancies/{$this->tenancy->id}/documents")
        ->assertOk()
        ->assertJsonStructure(['data' => ['*' => ['id', 'file_name', 'file_type', 'file_size', 'category', 'uploaded_at']]]);
});

test('landlord can upload a document to a tenancy', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');

    $this->actingAs($this->landlord, 'sanctum')
        ->postJson("/api/v1/landlord/tenancies/{$this->tenancy->id}/documents", [
            'document' => $file,
            'category' => 'tenancy_agreement',
        ])
        ->assertCreated()
        ->assertJsonStructure(['message', 'data' => ['id', 'file_name']]);

    expect(Document::count())->toBe(1);
});

test('landlord cannot upload without document file', function () {
    $this->actingAs($this->landlord, 'sanctum')
        ->postJson("/api/v1/landlord/tenancies/{$this->tenancy->id}/documents", [
            'category' => 'tenancy_agreement',
        ])
        ->assertUnprocessable();
});

test('landlord cannot upload without category', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');

    $this->actingAs($this->landlord, 'sanctum')
        ->postJson("/api/v1/landlord/tenancies/{$this->tenancy->id}/documents", [
            'document' => $file,
        ])
        ->assertUnprocessable();
});

test('landlord can download a document', function () {
    Storage::disk('documents')->put('tenancy_agreement/Tenancy/1/test.pdf', 'fake pdf content');

    $document = Document::create([
        'user_id' => $this->landlord->id,
        'documentable_type' => Tenancy::class,
        'documentable_id' => $this->tenancy->id,
        'file_path' => 'tenancy_agreement/Tenancy/1/test.pdf',
        'file_name' => 'agreement.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    $this->actingAs($this->landlord, 'sanctum')
        ->get("/api/v1/landlord/documents/{$document->id}/download")
        ->assertOk();
});

test('landlord can delete a document', function () {
    Storage::disk('documents')->put('tenancy_agreement/Tenancy/1/test.pdf', 'fake pdf content');

    $document = Document::create([
        'user_id' => $this->landlord->id,
        'documentable_type' => Tenancy::class,
        'documentable_id' => $this->tenancy->id,
        'file_path' => 'tenancy_agreement/Tenancy/1/test.pdf',
        'file_name' => 'agreement.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    $this->actingAs($this->landlord, 'sanctum')
        ->deleteJson("/api/v1/landlord/documents/{$document->id}")
        ->assertOk()
        ->assertJson(['message' => 'Document deleted successfully']);

    expect(Document::find($document->id))->toBeNull();
});

test('landlord cannot access documents for tenancy they do not own', function () {
    $otherLandlord = User::factory()->create(['role' => 'landlord']);
    $otherProperty = Property::factory()->create(['owner_id' => $otherLandlord->id]);
    $otherUnit = Unit::factory()->create(['property_id' => $otherProperty->id]);
    $otherTenancy = Tenancy::factory()->create(['unit_id' => $otherUnit->id]);

    $this->actingAs($this->landlord, 'sanctum')
        ->getJson("/api/v1/landlord/tenancies/{$otherTenancy->id}/documents")
        ->assertForbidden();
});

test('tenant cannot access landlord document endpoints', function () {
    $tenantUser = User::factory()->create(['role' => 'tenant']);

    $this->actingAs($tenantUser, 'sanctum')
        ->getJson("/api/v1/landlord/tenancies/{$this->tenancy->id}/documents")
        ->assertForbidden();
});

test('unauthenticated user cannot access document endpoints', function () {
    $this->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
    $this->app['auth']->forgetGuards();

    $this->getJson("/api/v1/landlord/tenancies/{$this->tenancy->id}/documents", ['Authorization' => ''])
        ->assertUnauthorized();
});
