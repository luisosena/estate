<?php

use App\Models\Payment;
use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use App\Services\ReceiptService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();

    $this->tenant = Tenant::factory()->create();
    $this->unit->update(['status' => 'occupied']);
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
        'monthly_rent' => 15000,
    ]);
});

test('landlord can list payments', function () {
    $this->getJson('/api/v1/landlord/payments')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

test('landlord can record a payment', function () {
    $response = $this->postJson('/api/v1/landlord/payments', [
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 15000,
        'payment_type' => 'rent',
        'payment_method' => 'bank_transfer',
        'status' => 'paid',
        'paid_at' => now()->toDateTimeString(),
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('payments', ['tenancy_id' => $this->tenancy->id, 'amount' => 15000]);
});

test('landlord can link payment to a rent bill', function () {
    $bill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date' => now()->endOfMonth(),
        'amount_due' => 15000,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);

    $response = $this->postJson('/api/v1/landlord/payments', [
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'rent_bill_id' => $bill->id,
        'amount' => 15000,
        'payment_type' => 'rent',
        'payment_method' => 'bank_transfer',
        'status' => 'paid',
        'paid_at' => now()->toDateTimeString(),
    ]);

    $response->assertCreated();
    expect($bill->fresh()->status)->toBe('paid');
});

test('landlord can link payment to a utility bill', function () {
    $utilityType = UtilityType::factory()->create(['is_active' => true]);
    $tu = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $utilityType->id,
    ]);
    $utilityBill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $tu->id,
        'amount_due' => 2000,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);

    $response = $this->postJson('/api/v1/landlord/payments', [
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'utility_bill_id' => $utilityBill->id,
        'amount' => 2000,
        'payment_type' => 'utility',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now()->toDateTimeString(),
    ]);

    $response->assertCreated();
    expect($utilityBill->fresh()->status)->toBe('pending');
});

test('payment creation fails without required fields', function () {
    $this->postJson('/api/v1/landlord/payments', [])->assertUnprocessable();
});

test('landlord can view single payment', function () {
    $payment = Payment::create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->getJson("/api/v1/landlord/payments/{$payment->id}")->assertOk();
});

test('landlord can update a payment note', function () {
    $payment = Payment::create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->putJson("/api/v1/landlord/payments/{$payment->id}", ['notes' => 'Updated note'])
        ->assertOk();
});

test('landlord can delete a payment', function () {
    $payment = Payment::create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->deleteJson("/api/v1/landlord/payments/{$payment->id}")->assertOk();
});

test('landlord cannot view another landlords payment', function () {
    $other = User::factory()->create(['role' => 'landlord']);
    $otherProp = Property::factory()->create(['owner_id' => $other->id]);
    $otherUnit = Unit::factory()->create(['property_id' => $otherProp->id]);
    $otherTenant = Tenant::factory()->create();
    $otherTenancy = Tenancy::factory()->create(['tenant_id' => $otherTenant->id, 'unit_id' => $otherUnit->id]);
    $otherPayment = Payment::create([
        'tenant_id' => $otherTenant->id,
        'tenancy_id' => $otherTenancy->id,
        'amount' => 1000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->getJson("/api/v1/landlord/payments/{$otherPayment->id}")->assertNotFound();
});

test('landlord can download a payment receipt as PDF', function () {
    $payment = Payment::create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $response = $this->get("/api/v1/landlord/payments/{$payment->id}/receipt");

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertHeaderContains('Content-Disposition', 'attachment');
});

test('landlord cannot download receipt for another landlords payment', function () {
    $other = User::factory()->create(['role' => 'landlord']);
    $otherProp = Property::factory()->create(['owner_id' => $other->id]);
    $otherUnit = Unit::factory()->create(['property_id' => $otherProp->id]);
    $otherTenant = Tenant::factory()->create();
    $otherTenancy = Tenancy::factory()->create(['tenant_id' => $otherTenant->id, 'unit_id' => $otherUnit->id]);
    $otherPayment = Payment::create([
        'tenant_id' => $otherTenant->id,
        'tenancy_id' => $otherTenancy->id,
        'amount' => 1000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->getJson("/api/v1/landlord/payments/{$otherPayment->id}/receipt")
        ->assertNotFound();
});

test('landlord receipt returns 400 for unpaid payment', function () {
    $payment = Payment::create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'pending',
        'paid_at' => null,
    ]);

    $this->get("/api/v1/landlord/payments/{$payment->id}/receipt")
        ->assertStatus(400);
});

test('landlord receipt returns 500 when generation fails', function () {
    $payment = Payment::create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->mock(ReceiptService::class, function ($mock) {
        $mock->shouldReceive('stream')->andThrow(new RuntimeException('PDF engine failure'));
    });

    $this->get("/api/v1/landlord/payments/{$payment->id}/receipt")
        ->assertStatus(500);
});
