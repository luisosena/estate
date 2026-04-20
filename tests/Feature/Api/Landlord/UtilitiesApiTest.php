<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();

    $this->tenant      = Tenant::factory()->create();
    $this->unit->update(['status' => 'occupied']);
    $this->tenancy     = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id'   => $this->unit->id,
        'status'    => 'active',
    ]);
    $this->utilityType = UtilityType::factory()->create(['is_active' => true]);
});

// --- Utility types ---

test('landlord can list utility types', function () {
    $this->getJson('/api/landlord/utility-types')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

// --- Tenancy utilities ---

test('landlord can assign utility to tenancy', function () {
    $this->postJson("/api/landlord/tenancies/{$this->tenancy->id}/utilities", [
        'utility_type_id' => $this->utilityType->id,
        'amount'          => 2500,
        'billing_cycle'   => 'monthly',
        'status'          => 'active',
    ])->assertCreated();

    $this->assertDatabaseHas('tenancy_utilities', [
        'tenancy_id'      => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
});

test('landlord can update a tenancy utility', function () {
    $tu = TenancyUtility::factory()->create([
        'tenancy_id'      => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'amount'          => 1000,
    ]);

    $this->putJson("/api/landlord/tenancy-utilities/{$tu->id}", ['amount' => 2000])
        ->assertOk();

    expect($tu->fresh()->amount)->toEqual('2000.00');
});

test('landlord can remove utility with no unpaid bills', function () {
    $tu = TenancyUtility::factory()->create([
        'tenancy_id'      => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);

    $this->deleteJson("/api/landlord/tenancy-utilities/{$tu->id}")->assertOk();
    $this->assertDatabaseMissing('tenancy_utilities', ['id' => $tu->id]);
});

test('landlord cannot remove utility with unpaid bills', function () {
    $tu = TenancyUtility::factory()->create([
        'tenancy_id'      => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    UtilityBill::factory()->create(['tenancy_utility_id' => $tu->id, 'status' => 'pending']);

    $this->deleteJson("/api/landlord/tenancy-utilities/{$tu->id}")->assertUnprocessable();
});

// --- Utility bills ---

test('landlord can list utility bills', function () {
    $this->getJson('/api/landlord/utility-bills')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

test('landlord can view a single utility bill', function () {
    $tu   = TenancyUtility::factory()->create(['tenancy_id' => $this->tenancy->id, 'utility_type_id' => $this->utilityType->id]);
    $bill = UtilityBill::factory()->create(['tenancy_utility_id' => $tu->id, 'status' => 'pending']);

    $this->getJson("/api/landlord/utility-bills/{$bill->id}")
        ->assertOk()
        ->assertJsonFragment(['id' => $bill->id]);
});

test('landlord can waive a pending utility bill', function () {
    $tu   = TenancyUtility::factory()->create(['tenancy_id' => $this->tenancy->id, 'utility_type_id' => $this->utilityType->id]);
    $bill = UtilityBill::factory()->create(['tenancy_utility_id' => $tu->id, 'status' => 'pending', 'amount_due' => 1500, 'amount_paid' => 0]);

    $this->postJson("/api/landlord/utility-bills/{$bill->id}/waive", ['notes' => 'Waiver reason'])
        ->assertOk();

    expect($bill->fresh()->status)->toBe('waived');
});

test('landlord cannot waive an already paid utility bill', function () {
    $tu   = TenancyUtility::factory()->create(['tenancy_id' => $this->tenancy->id, 'utility_type_id' => $this->utilityType->id]);
    $bill = UtilityBill::factory()->create(['tenancy_utility_id' => $tu->id, 'status' => 'paid', 'amount_due' => 1500, 'amount_paid' => 1500]);

    $this->postJson("/api/landlord/utility-bills/{$bill->id}/waive")->assertUnprocessable();
});
