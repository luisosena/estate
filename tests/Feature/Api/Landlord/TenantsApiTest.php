<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();

    $this->tenant = Tenant::factory()->create(['email' => 'tenant@example.com']);
    $this->unit->update(['status' => 'occupied']);
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
        'monthly_rent' => 10000,
    ]);
});

test('landlord can list own tenants', function () {
    $this->getJson('/api/v1/landlord/tenants')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id', 'tenant_code', 'full_name', 'phone', 'email',
                    'tenancy_id', 'tenancy_status', 'unit_name', 'unit_code', 'property_name',
                ],
            ],
            'meta' => ['current_page', 'total', 'total_pages'],
            'stats' => ['total_tenants', 'total_units', 'occupied_units', 'occupancy_rate'],
        ]);
});

test('landlord can view tenant detail by identifier', function () {
    $this->getJson("/api/v1/landlord/tenants/{$this->tenant->tenant_code}")
        ->assertOk()
        ->assertJsonPath('data.tenant.id', $this->tenant->id);
});

test('landlord can onboard a new tenant via API', function () {
    $this->unit->update(['status' => 'available']);
    $freshUnit = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'available']);

    $response = $this->postJson('/api/v1/landlord/tenants', [
        'full_name' => 'John API',
        'email' => 'john.api@example.com',
        'phone' => '0700000001',
        'unit_id' => $freshUnit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 12000,
        'security_deposit' => 24000,
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('tenants', ['email' => 'john.api@example.com']);
});

test('tenant onboarding fails without required fields', function () {
    $this->postJson('/api/v1/landlord/tenants', [])->assertUnprocessable();
});

test('landlord can remove own tenant', function () {
    $this->deleteJson("/api/v1/landlord/tenants/{$this->tenancy->id}/remove")
        ->assertOk();
});

test('landlord cannot remove another landlords tenant', function () {
    $otherLandlord = User::factory()->create(['role' => 'landlord']);
    $otherProperty = Property::factory()->create(['owner_id' => $otherLandlord->id]);
    $otherUnit = Unit::factory()->create(['property_id' => $otherProperty->id, 'status' => 'occupied']);
    $otherTenant = Tenant::factory()->create(['email' => 'other@example.com']);
    $otherTenancy = Tenancy::factory()->create([
        'tenant_id' => $otherTenant->id,
        'unit_id' => $otherUnit->id,
        'status' => 'active',
    ]);

    $this->deleteJson("/api/v1/landlord/tenants/{$otherTenancy->id}/remove")
        ->assertNotFound();
});
