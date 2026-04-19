<?php

use App\Models\Payment;
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

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit     = Unit::factory()->create(['property_id' => $this->property->id]);
    $this->tenant   = Tenant::factory()->create();
    $this->tenancy  = Tenancy::factory()->create([
        'tenant_id'    => $this->tenant->id,
        'unit_id'      => $this->unit->id,
        'status'       => 'active',
        'monthly_rent' => 20000,
    ]);
});

// --- Payment model boot validations ---

test('Payment model boot rejects utility_bill_id belonging to a different tenancy', function () {
    $otherTenancy = Tenancy::factory()->create();
    $utilityType  = UtilityType::factory()->create(['is_active' => true]);
    $tu           = TenancyUtility::factory()->create(['tenancy_id' => $otherTenancy->id, 'utility_type_id' => $utilityType->id]);
    $bill         = UtilityBill::factory()->create(['tenancy_utility_id' => $tu->id]);

    expect(fn () => Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'utility_bill_id' => $bill->id,
        'amount'         => 500,
        'payment_type'   => 'utility',
        'payment_method' => 'mobile_money',
        'status'         => 'pending',
        'paid_at'        => now(),
    ]))->toThrow(InvalidArgumentException::class);
});

test('Payment model boot rejects rent_bill_id belonging to a different tenancy', function () {
    $otherTenancy = Tenancy::factory()->create();
    $rentBill     = RentBill::factory()->create([
        'tenancy_id'    => $otherTenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
    ]);

    expect(fn () => Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'rent_bill_id'   => $rentBill->id,
        'amount'         => 1000,
        'payment_type'   => 'rent',
        'payment_method' => 'bank_transfer',
        'status'         => 'pending',
        'paid_at'        => now(),
    ]))->toThrow(InvalidArgumentException::class);
});

// --- Payment::calculateStatus ---

test('calculateStatus returns paid when total equals monthly rent', function () {
    $payment = Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 20000,
        'payment_type'   => 'rent',
        'payment_method' => 'bank_transfer',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    expect($payment->calculateStatus($this->tenancy))->toBe('paid');
});

test('calculateStatus returns partial when total is less than monthly rent', function () {
    Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 10000,
        'payment_type'   => 'rent',
        'payment_method' => 'bank_transfer',
        'status'         => 'partial',
        'paid_at'        => now(),
    ]);

    $payment = Payment::where('tenancy_id', $this->tenancy->id)->first();
    expect($payment->calculateStatus($this->tenancy))->toBe('partial');
});

test('calculateStatus returns pending when no payments recorded', function () {
    $payment = Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 1,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'pending',
        'paid_at'        => now(),
    ]);

    // A fresh tenancy with no paid/partial payments returns pending
    $fresh = Tenancy::factory()->create(['monthly_rent' => 5000]);
    expect($payment->calculateStatus($fresh))->toBe('pending');
});

// --- Payment::calculatePendingAmount ---

test('calculatePendingAmount returns remaining balance after payments', function () {
    Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 8000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'partial',
        'paid_at'        => now(),
    ]);

    $pending = Payment::calculatePendingAmount($this->tenancy);

    expect($pending)->toBe(12000.0); // 20000 - 8000
});

test('calculatePendingAmount returns zero when fully paid', function () {
    Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 20000,
        'payment_type'   => 'rent',
        'payment_method' => 'bank_transfer',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    expect(Payment::calculatePendingAmount($this->tenancy))->toBe(0.0);
});

// --- Soft deletes ---

test('soft-deleted payment is not returned in regular queries', function () {
    $payment = Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    $payment->delete();

    expect(Payment::find($payment->id))->toBeNull()
        ->and(Payment::withTrashed()->find($payment->id))->not->toBeNull();
});

// --- tenant_code appended attribute ---

test('tenant_code attribute resolves correctly from tenant relationship', function () {
    $payment = Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    $payment->load('tenant');

    expect($payment->tenant_code)->toBe($this->tenant->tenant_code);
});
