<?php

use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    [
        'user'    => $this->user,
        'tenant'  => $this->tenant,
        'tenancy' => $this->tenancy,
    ] = $this->createApiTenant();

    $this->bill = RentBill::factory()->create([
        'tenancy_id'    => $this->tenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
        'amount_due'    => 15000,
        'amount_paid'   => 0,
        'status'        => 'pending',
    ]);
});

test('tenant can list own rent bills', function () {
    $this->getJson('/api/tenant/rent-bills')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

test('tenant can view current rent bill', function () {
    $this->getJson('/api/tenant/rent-bills/current')
        ->assertOk();
});

test('tenant can view single own rent bill', function () {
    $this->getJson("/api/tenant/rent-bills/{$this->bill->id}")
        ->assertOk()
        ->assertJsonFragment(['id' => $this->bill->id]);
});

test('tenant cannot view another tenants rent bill', function () {
    $otherTenant  = Tenant::factory()->create();
    $otherUser    = User::factory()->create(['role' => 'tenant', 'tenant_id' => $otherTenant->id]);
    $otherUnit    = Unit::factory()->create(['status' => 'occupied']);
    $otherTenancy = Tenancy::factory()->create([
        'tenant_id' => $otherTenant->id,
        'unit_id'   => $otherUnit->id,
        'status'    => 'active',
    ]);
    $otherBill = RentBill::factory()->create([
        'tenancy_id'    => $otherTenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
    ]);

    $this->getJson("/api/tenant/rent-bills/{$otherBill->id}")->assertForbidden();
});

test('tenant with no active tenancy receives empty rent bills list', function () {
    $this->tenancy->update(['status' => 'ended']);

    $response = $this->getJson('/api/tenant/rent-bills')->assertOk();

    expect($response->json('data'))->toBeEmpty();
});
