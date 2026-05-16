<?php

use App\Models\Document;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenantUser = User::factory()->create(['role' => 'tenant']);
    $this->tenant = Tenant::factory()->create();
    $this->tenantUser->tenant()->associate($this->tenant)->save();

    $landlord = User::factory()->create(['role' => 'landlord']);
    $property = Property::factory()->create(['owner_id' => $landlord->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $unit->id,
        'status' => 'active',
    ]);

    Storage::fake('documents');
});

test('tenant can list own documents', function () {
    Storage::disk('documents')->put('tenancy_agreement/Tenancy/1/test.pdf', 'fake pdf content');

    Document::create([
        'user_id' => $this->tenantUser->id,
        'documentable_type' => Tenancy::class,
        'documentable_id' => $this->tenancy->id,
        'file_path' => 'tenancy_agreement/Tenancy/1/test.pdf',
        'file_name' => 'agreement.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    $this->actingAs($this->tenantUser, 'sanctum')
        ->getJson('/api/v1/tenant/documents')
        ->assertOk()
        ->assertJsonStructure(['data' => ['*' => ['id', 'file_name', 'file_type', 'file_size', 'category', 'uploaded_at']]]);
});

test('tenant can download own document', function () {
    Storage::disk('documents')->put('tenancy_agreement/Tenancy/1/test.pdf', 'fake pdf content');

    $document = Document::create([
        'user_id' => $this->tenantUser->id,
        'documentable_type' => Tenancy::class,
        'documentable_id' => $this->tenancy->id,
        'file_path' => 'tenancy_agreement/Tenancy/1/test.pdf',
        'file_name' => 'agreement.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    $this->actingAs($this->tenantUser, 'sanctum')
        ->get("/api/v1/tenant/documents/{$document->id}/download")
        ->assertOk();
});

test('tenant cannot download document from another tenancy', function () {
    $otherTenantUser = User::factory()->create(['role' => 'tenant']);
    $otherTenant = Tenant::factory()->create();
    $otherTenantUser->tenant()->associate($otherTenant)->save();
    $otherTenancy = Tenancy::factory()->create(['tenant_id' => $otherTenant->id]);

    Storage::disk('documents')->put('tenancy_agreement/Tenancy/2/test.pdf', 'fake pdf content');

    $document = Document::create([
        'user_id' => $otherTenantUser->id,
        'documentable_type' => Tenancy::class,
        'documentable_id' => $otherTenancy->id,
        'file_path' => 'tenancy_agreement/Tenancy/2/test.pdf',
        'file_name' => 'agreement.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    $this->actingAs($this->tenantUser, 'sanctum')
        ->get("/api/v1/tenant/documents/{$document->id}/download")
        ->assertForbidden();
});

test('tenant with no active tenancy gets empty document list', function () {
    $this->tenancy->update(['status' => 'ended']);

    $this->actingAs($this->tenantUser, 'sanctum')
        ->getJson('/api/v1/tenant/documents')
        ->assertOk()
        ->assertJson(['data' => []]);
});

test('landlord cannot access tenant document endpoints', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);

    $this->actingAs($landlord, 'sanctum')
        ->getJson('/api/v1/tenant/documents')
        ->assertForbidden();
});

test('unauthenticated user cannot access tenant document endpoints', function () {
    $this->getJson('/api/v1/tenant/documents')
        ->assertUnauthorized();
});
