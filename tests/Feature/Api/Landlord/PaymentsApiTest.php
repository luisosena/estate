<?php

use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\UtilityBill;
use App\Models\UtilityType;
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
});

test('landlord can list payments', function () {
    $this->getJson('/api/landlord/payments')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

test('landlord can record a payment', function () {
    $response = $this->postJson('/api/landlord/payments', [
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 15000,
        'payment_type'   => 'rent',
        'payment_method' => 'bank_transfer',
        'paid_at'        => now()->toDateTimeString(),
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('payments', ['tenancy_id' => $this->tenancy->id, 'amount' => 15000]);
});

test('landlord can link payment to a rent bill', function () {
    $bill = RentBill::factory()->create([
        'tenancy_id'    => $this->tenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
        'amount_due'    => 15000,
        'amount_paid'   => 0,
        'status'        => 'pending',
    ]);

    $response = $this->postJson('/api/landlord/payments', [
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'rent_bill_id'   => $bill->id,
        'amount'         => 15000,
        'payment_type'   => 'rent',
        'payment_method' => 'bank_transfer',
        'paid_at'        => now()->toDateTimeString(),
    ]);

    $response->assertCreated();
    expect($bill->fresh()->status)->toBe('paid');
});

test('landlord can link payment to a utility bill', function () {
    $utilityType = UtilityType::factory()->create(['is_active' => true]);
    $tu          = TenancyUtility::factory()->create([
        'tenancy_id'      => $this->tenancy->id,
        'utility_type_id' => $utilityType->id,
    ]);
    $utilityBill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $tu->id,
        'amount_due'         => 2000,
        'amount_paid'        => 0,
        'status'             => 'pending',
    ]);

    $response = $this->postJson('/api/landlord/payments', [
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'utility_bill_id' => $utilityBill->id,
        'amount'         => 2000,
        'payment_type'   => 'utility',
        'payment_method' => 'mobile_money',
        'paid_at'        => now()->toDateTimeString(),
    ]);

    $response->assertCreated();
    expect($utilityBill->fresh()->status)->toBe('paid');
});

test('payment creation fails without required fields', function () {
    $this->postJson('/api/landlord/payments', [])->assertUnprocessable();
});

test('landlord can view single payment', function () {
    $payment = \App\Models\Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    $this->getJson("/api/landlord/payments/{$payment->id}")->assertOk();
});

test('landlord can update a payment note', function () {
    $payment = \App\Models\Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    $this->putJson("/api/landlord/payments/{$payment->id}", ['notes' => 'Updated note'])
        ->assertOk();
});

test('landlord can delete a payment', function () {
    $payment = \App\Models\Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    $this->deleteJson("/api/landlord/payments/{$payment->id}")->assertOk();
});

test('landlord cannot view another landlords payment', function () {
    $other        = User::factory()->create(['role' => 'landlord']);
    $otherProp    = Property::factory()->create(['owner_id' => $other->id]);
    $otherUnit    = Unit::factory()->create(['property_id' => $otherProp->id]);
    $otherTenant  = Tenant::factory()->create();
    $otherTenancy = Tenancy::factory()->create(['tenant_id' => $otherTenant->id, 'unit_id' => $otherUnit->id]);
    $otherPayment = \App\Models\Payment::create([
        'tenant_id'      => $otherTenant->id,
        'tenancy_id'     => $otherTenancy->id,
        'amount'         => 1000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    $this->getJson("/api/landlord/payments/{$otherPayment->id}")->assertForbidden();
});
