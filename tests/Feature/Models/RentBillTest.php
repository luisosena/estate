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
    $landlord = User::factory()->create(['role' => 'landlord']);
    $property = Property::factory()->create(['owner_id' => $landlord->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create(['tenant_id' => $tenant->id, 'unit_id' => $unit->id, 'monthly_rent' => 10000]);
    $this->bill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => now()->startOfMonth(),
        'due_date' => now()->addDays(10),
        'amount_due' => 10000,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);
});

// --- markPaid ---

test('markPaid accumulates amount_paid on consecutive partial payments', function () {
    $this->bill->markPaid(4000);
    $this->bill->markPaid(6000);

    expect($this->bill->fresh()->amount_paid)->toEqual('10000.00')
        ->and($this->bill->fresh()->status)->toBe('paid');
});

test('markPaid transitions to partial when amount is less than due', function () {
    $this->bill->markPaid(3000);

    expect($this->bill->fresh()->status)->toBe('partial')
        ->and($this->bill->fresh()->amount_paid)->toEqual('3000.00');
});

// --- outstanding_amount accessor ---

test('outstanding_amount returns the remaining balance', function () {
    $this->bill->update(['amount_paid' => 4000]);

    expect($this->bill->fresh()->outstanding_amount)->toBe(6000.0);
});

test('outstanding_amount never goes below zero', function () {
    $this->bill->update(['amount_paid' => 15000]); // overpaid

    expect($this->bill->fresh()->outstanding_amount)->toBe(0.0);
});

// --- Scopes ---

test('scopePending returns only pending bills', function () {
    RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'status' => 'paid',
        'billing_month' => now()->subMonth()->startOfMonth(),
        'due_date' => now()->subMonth()->endOfMonth(),
    ]);

    $pending = RentBill::pending()->get();

    expect($pending->every(fn ($b) => $b->status === 'pending'))->toBeTrue();
});

test('scopeOverdue includes past-due pending and partial bills', function () {
    RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'status' => 'pending',
        'billing_month' => now()->subMonths(2)->startOfMonth(),
        'due_date' => now()->subMonth(), // past due
        'amount_due' => 10000,
        'amount_paid' => 0,
    ]);

    $overdue = RentBill::overdue()->get();

    expect($overdue->count())->toBeGreaterThanOrEqual(1);
});

// --- Virtual attributes ---

test('tenant virtual attribute resolves via tenancy chain', function () {
    $this->bill->load('tenancy.tenant');

    expect($this->bill->tenant)->not->toBeNull()
        ->and($this->bill->tenant->id)->toBe($this->tenancy->tenant_id);
});

test('unit virtual attribute resolves via tenancy chain', function () {
    $this->bill->load('tenancy.unit');

    expect($this->bill->unit)->not->toBeNull()
        ->and($this->bill->unit->id)->toBe($this->tenancy->unit_id);
});
