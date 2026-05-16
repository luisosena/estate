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
    // Create landlord-owned tenancy
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id]);
    $this->tenantUser = User::factory()->create(['role' => 'tenant']);
    $this->tenant = Tenant::factory()->create();
    $this->tenantUser->tenant()->associate($this->tenant)->save();
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
    ]);

    // Create document on the tenancy
    Storage::fake('documents');
    $this->document = Document::factory()->create([
        'documentable_type' => Tenancy::class,
        'documentable_id' => $this->tenancy->id,
        'user_id' => $this->landlord->id,
    ]);

    // Create admin user
    $this->admin = User::factory()->create(['role' => 'admin']);

    // Create other landlord
    $this->otherLandlord = User::factory()->create(['role' => 'landlord']);
    $this->otherProperty = Property::factory()->create(['owner_id' => $this->otherLandlord->id]);
    $this->otherUnit = Unit::factory()->create(['property_id' => $this->otherProperty->id]);
    $this->otherTenancy = Tenancy::factory()->create(['unit_id' => $this->otherUnit->id]);

    // Create other tenant
    $this->otherTenantUser = User::factory()->create(['role' => 'tenant']);
    $this->otherTenant = Tenant::factory()->create();
    $this->otherTenantUser->tenant()->associate($this->otherTenant)->save();
});

// --- Admin bypass ---

test('admin can upload', function () {
    expect($this->admin->can('upload', [\App\Models\Document::class, $this->tenancy]))->toBeTrue();
});

test('admin can view any', function () {
    expect($this->admin->can('viewAny', [\App\Models\Document::class, $this->tenancy]))->toBeTrue();
});

test('admin can view', function () {
    expect($this->admin->can('view', $this->document))->toBeTrue();
});

test('admin can download', function () {
    expect($this->admin->can('download', $this->document))->toBeTrue();
});

test('admin can delete', function () {
    expect($this->admin->can('delete', $this->document))->toBeTrue();
});

// --- Landlord who owns property ---

test('landlord who owns property can upload', function () {
    expect($this->landlord->can('upload', [\App\Models\Document::class, $this->tenancy]))->toBeTrue();
});

test('landlord who owns property can view any', function () {
    expect($this->landlord->can('viewAny', [\App\Models\Document::class, $this->tenancy]))->toBeTrue();
});

test('landlord who owns property can view', function () {
    expect($this->landlord->can('view', $this->document))->toBeTrue();
});

test('landlord who owns property can download', function () {
    expect($this->landlord->can('download', $this->document))->toBeTrue();
});

test('landlord who owns property can delete', function () {
    expect($this->landlord->can('delete', $this->document))->toBeTrue();
});

// --- Landlord who does not own property ---

test('landlord who does not own property cannot upload', function () {
    expect($this->otherLandlord->can('upload', [\App\Models\Document::class, $this->tenancy]))->toBeFalse();
});

test('landlord who does not own property cannot view any', function () {
    expect($this->otherLandlord->can('viewAny', [\App\Models\Document::class, $this->tenancy]))->toBeFalse();
});

test('landlord who does not own property cannot view', function () {
    expect($this->otherLandlord->can('view', $this->document))->toBeFalse();
});

test('landlord who does not own property cannot download', function () {
    expect($this->otherLandlord->can('download', $this->document))->toBeFalse();
});

test('landlord who does not own property cannot delete', function () {
    expect($this->otherLandlord->can('delete', $this->document))->toBeFalse();
});

// --- Tenant ---

test('tenant cannot upload', function () {
    expect($this->tenantUser->can('upload', [\App\Models\Document::class, $this->tenancy]))->toBeFalse();
});

test('tenant cannot view any', function () {
    expect($this->tenantUser->can('viewAny', [\App\Models\Document::class, $this->tenancy]))->toBeFalse();
});

test('tenant on tenancy can view', function () {
    expect($this->tenantUser->can('view', $this->document))->toBeTrue();
});

test('tenant on tenancy can download', function () {
    expect($this->tenantUser->can('download', $this->document))->toBeTrue();
});

test('tenant not on tenancy cannot view', function () {
    expect($this->otherTenantUser->can('view', $this->document))->toBeFalse();
});

test('tenant not on tenancy cannot download', function () {
    expect($this->otherTenantUser->can('download', $this->document))->toBeFalse();
});

test('tenant cannot delete', function () {
    expect($this->tenantUser->can('delete', $this->document))->toBeFalse();
});
