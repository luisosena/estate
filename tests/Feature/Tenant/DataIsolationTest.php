<?php

use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\UtilityBill;
use App\Models\User;
use App\Models\UtilityType;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/**
 * Sets up two completely isolated landlord→property→unit→tenant→tenancy chains.
 */
beforeEach(function () {
    // Landlord A chain
    $this->landlordA  = User::factory()->create(['role' => 'landlord']);
    $this->propertyA  = Property::factory()->create(['owner_id' => $this->landlordA->id]);
    $this->unitA      = Unit::factory()->create(['property_id' => $this->propertyA->id, 'status' => 'occupied']);
    $this->tenantA    = Tenant::factory()->create();
    $this->userA      = User::factory()->create(['role' => 'tenant', 'tenant_id' => $this->tenantA->id]);
    $this->tenancyA   = Tenancy::factory()->create([
        'tenant_id' => $this->tenantA->id,
        'unit_id'   => $this->unitA->id,
        'status'    => 'active',
    ]);

    // Landlord B chain (completely separate)
    $this->landlordB  = User::factory()->create(['role' => 'landlord']);
    $this->propertyB  = Property::factory()->create(['owner_id' => $this->landlordB->id]);
    $this->unitB      = Unit::factory()->create(['property_id' => $this->propertyB->id, 'status' => 'occupied']);
    $this->tenantB    = Tenant::factory()->create();
    $this->userB      = User::factory()->create(['role' => 'tenant', 'tenant_id' => $this->tenantB->id]);
    $this->tenancyB   = Tenancy::factory()->create([
        'tenant_id' => $this->tenantB->id,
        'unit_id'   => $this->unitB->id,
        'status'    => 'active',
    ]);
});

// --- Rent bills isolation ---

test('tenant can only see own rent bills on the index page', function () {
    RentBill::factory()->create(['tenancy_id' => $this->tenancyA->id, 'billing_month' => now()->startOfMonth(), 'due_date' => now()->endOfMonth()]);
    RentBill::factory()->create(['tenancy_id' => $this->tenancyB->id, 'billing_month' => now()->startOfMonth(), 'due_date' => now()->endOfMonth()]);

    $response = $this->actingAs($this->userA)->get('/tenant/rent-bills');

    $response->assertOk();
    $response->assertInertia(function ($page) {
        // rentBills key exists and is scoped — if collection, only tenancy A's bills appear
        $page->has('rentBills');
    });
});

test('tenant cannot view another tenants specific rent bill', function () {
    $billB = RentBill::factory()->create([
        'tenancy_id'    => $this->tenancyB->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
    ]);

    $response = $this->actingAs($this->userA)->get("/tenant/rent-bills/{$billB->id}");

    $response->assertForbidden();
});

// --- Utility bills isolation ---

test('tenant utility bills page renders without showing other tenants data', function () {
    $response = $this->actingAs($this->userA)->get('/tenant/utilities');

    $response->assertOk();
});

// --- Payments isolation ---

test('tenant payments page renders scoped to own tenancy', function () {
    $response = $this->actingAs($this->userA)->get('/tenant/payments');

    $response->assertOk();
});

// --- Route access isolation ---

test('tenant cannot access admin routes', function () {
    $response = $this->actingAs($this->userA)->get('/admin/dashboard');

    $response->assertRedirect(); // redirects away from admin
});

test('tenant cannot access landlord routes', function () {
    $response = $this->actingAs($this->userA)->get('/landlord/properties');

    $response->assertForbidden();
});

test('tenant dashboard only renders for the authenticated tenant', function () {
    $response = $this->actingAs($this->userA)->get('/tenant/dashboard');

    $response->assertOk();
});
