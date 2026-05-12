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

it('returns 403 when a tenant views another tenants rent bill', function (): void {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $property = Property::factory()->create();
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenancyA = Tenancy::factory()->create([
        'unit_id' => $unit->id,
        'tenant_id' => $tenantA->id,
        'status' => 'active',
    ]);
    $tenancyB = Tenancy::factory()->create([
        'unit_id' => $unit->id,
        'tenant_id' => $tenantB->id,
        'status' => 'active',
    ]);
    $rentBill = RentBill::factory()->create(['tenancy_id' => $tenancyB->id]);

    $userA = User::factory()->create(['role' => 'tenant', 'tenant_id' => $tenantA->id]);
    Sanctum::actingAs($userA, ['*']);

    $this->getJson("/api/v1/tenant/rent-bills/{$rentBill->id}")
        ->assertForbidden();
});
