<?php

use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();

    $this->tenant  = Tenant::factory()->create();
    $this->unit->update(['status' => 'occupied']);
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id'    => $this->tenant->id,
        'unit_id'      => $this->unit->id,
        'status'       => 'active',
        'monthly_rent' => 15000,
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

test('landlord can list all rent bills', function () {
    $this->getJson('/api/landlord/rent-bills')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('landlord can filter rent bills by status', function () {
    $response = $this->getJson('/api/landlord/rent-bills?status=pending')->assertOk();

    $statuses = collect($response->json('data'))->pluck('status')->unique()->values();
    expect($statuses->count())->toBe(1)
        ->and($statuses->first())->toBe('pending');
});

test('landlord can list pending bills', function () {
    $this->getJson('/api/landlord/rent-bills/pending')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('landlord can list overdue bills', function () {
    $this->getJson('/api/landlord/rent-bills/overdue')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('landlord can view single rent bill', function () {
    $this->getJson("/api/landlord/rent-bills/{$this->bill->id}")
        ->assertOk()
        ->assertJsonFragment(['id' => $this->bill->id]);
});

test('landlord can waive a pending rent bill', function () {
    $this->postJson("/api/landlord/rent-bills/{$this->bill->id}/waive", ['notes' => 'Goodwill'])
        ->assertOk()
        ->assertJsonFragment(['status' => 'waived']);

    expect($this->bill->fresh()->status)->toBe('waived');
});

test('landlord cannot waive an already paid bill via API', function () {
    $this->bill->update(['status' => 'paid', 'amount_paid' => 15000]);

    $this->postJson("/api/landlord/rent-bills/{$this->bill->id}/waive")
        ->assertUnprocessable();
});

test('landlord cannot access another landlords rent bill', function () {
    $other        = User::factory()->create(['role' => 'landlord']);
    $otherProp    = Property::factory()->create(['owner_id' => $other->id]);
    $otherUnit    = Unit::factory()->create(['property_id' => $otherProp->id, 'status' => 'occupied']);
    $otherTenant  = Tenant::factory()->create();
    $otherTenancy = Tenancy::factory()->create(['tenant_id' => $otherTenant->id, 'unit_id' => $otherUnit->id, 'status' => 'active']);
    $otherBill    = RentBill::factory()->create([
        'tenancy_id'    => $otherTenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
    ]);

    $this->getJson("/api/landlord/rent-bills/{$otherBill->id}")->assertNotFound();
});
