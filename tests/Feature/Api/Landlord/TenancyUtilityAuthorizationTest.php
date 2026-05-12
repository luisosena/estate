<?php

use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('returns 403 when a landlord views another landlords tenancy utility', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->create([
        'unit_id' => $unit->id,
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);
    $tenancyUtility = TenancyUtility::factory()->create(['tenancy_id' => $tenancy->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->getJson("/api/v1/landlord/tenancy-utilities/{$tenancyUtility->id}")
        ->assertForbidden();
});

it('returns 403 when a landlord updates another landlords tenancy utility', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->create([
        'unit_id' => $unit->id,
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);
    $tenancyUtility = TenancyUtility::factory()->create(['tenancy_id' => $tenancy->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->putJson("/api/v1/landlord/tenancy-utilities/{$tenancyUtility->id}", ['amount' => 9999])
        ->assertForbidden();
});

it('returns 403 when a landlord deletes another landlords tenancy utility', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->create([
        'unit_id' => $unit->id,
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);
    $tenancyUtility = TenancyUtility::factory()->create(['tenancy_id' => $tenancy->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->deleteJson("/api/v1/landlord/tenancy-utilities/{$tenancyUtility->id}")
        ->assertForbidden();
});
