<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\UtilityBill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('returns 403 when a landlord views another landlords utility bill', function (): void {
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
    $utilityBill = UtilityBill::factory()->create(['tenancy_utility_id' => $tenancyUtility->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->getJson("/api/v1/landlord/utility-bills/{$utilityBill->id}")
        ->assertForbidden();
});

it('returns 403 when a landlord updates another landlords utility bill', function (): void {
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
    $utilityBill = UtilityBill::factory()->create(['tenancy_utility_id' => $tenancyUtility->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->putJson("/api/v1/landlord/utility-bills/{$utilityBill->id}", ['amount_due' => 9999])
        ->assertForbidden();
});

it('returns 403 when a landlord waives another landlords utility bill', function (): void {
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
    $utilityBill = UtilityBill::factory()->create(['tenancy_utility_id' => $tenancyUtility->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->postJson("/api/v1/landlord/utility-bills/{$utilityBill->id}/waive")
        ->assertForbidden();
});
