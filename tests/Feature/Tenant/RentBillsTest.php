<?php

use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit     = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'occupied']);
    $this->tenant   = Tenant::factory()->create();
    $this->user     = User::factory()->create(['role' => 'tenant', 'tenant_id' => $this->tenant->id]);
    $this->tenancy  = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id'   => $this->unit->id,
        'status'    => 'active',
    ]);
    $this->bill = RentBill::factory()->create([
        'tenancy_id'    => $this->tenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
        'amount_due'    => 15000,
        'amount_paid'   => 0,
        'status'        => 'pending',
    ]);
});

test('tenant can view own rent bills index', function () {
    $this->actingAs($this->user)
        ->get('/tenant/rent-bills')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('rentBills'));
});

test('tenant can view a specific own rent bill', function () {
    $this->actingAs($this->user)
        ->get("/tenant/rent-bills/{$this->bill->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('rentBill'));
});

test('tenant cannot view another tenants rent bill', function () {
    $otherTenant  = Tenant::factory()->create();
    $otherUnit    = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'occupied']);
    $otherTenancy = Tenancy::factory()->create(['tenant_id' => $otherTenant->id, 'unit_id' => $otherUnit->id, 'status' => 'active']);
    $otherBill    = RentBill::factory()->create([
        'tenancy_id'    => $otherTenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
    ]);

    $this->actingAs($this->user)
        ->get("/tenant/rent-bills/{$otherBill->id}")
        ->assertForbidden();
});

test('guest is redirected from rent bills index', function () {
    $this->get('/tenant/rent-bills')->assertRedirect('/login');
});

test('guest is redirected from rent bill detail page', function () {
    $this->get("/tenant/rent-bills/{$this->bill->id}")->assertRedirect('/login');
});
