<?php

use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('returns 403 when a landlord views another landlords rent bill', function (): void {
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
    $rentBill = RentBill::factory()->create(['tenancy_id' => $tenancy->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->getJson("/api/v1/landlord/rent-bills/{$rentBill->id}")
        ->assertForbidden();
});

it('returns 403 when a landlord waives another landlords rent bill', function (): void {
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
    $rentBill = RentBill::factory()->create(['tenancy_id' => $tenancy->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->postJson("/api/v1/landlord/rent-bills/{$rentBill->id}/waive")
        ->assertForbidden();
});
