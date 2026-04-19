<?php

use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Services\RentBillService;

use function Pest\Laravel\actingAs;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->service  = new RentBillService();
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
    $this->bill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'amount_due'  => 20000,
        'amount_paid' => 0,
        'status'      => 'pending',
        'billing_month' => now()->startOfMonth(),
        'due_date'    => now()->endOfMonth(),
    ]);
});

// --- processRentPayment ---

test('processRentPayment marks bill as paid on full payment', function () {
    $this->service->processRentPayment($this->bill, 20000);

    expect($this->bill->fresh()->status)->toBe('paid')
        ->and($this->bill->fresh()->amount_paid)->toEqual('20000.00');
});

test('processRentPayment marks bill as partial on underpayment', function () {
    $this->service->processRentPayment($this->bill, 10000);

    expect($this->bill->fresh()->status)->toBe('partial')
        ->and($this->bill->fresh()->amount_paid)->toEqual('10000.00');
});

test('processRentPayment throws on already paid bill', function () {
    $this->bill->update(['status' => 'paid', 'amount_paid' => 20000]);

    expect(fn () => $this->service->processRentPayment($this->bill->fresh(), 5000))
        ->toThrow(InvalidArgumentException::class);
});

test('processRentPayment throws on already waived bill', function () {
    $this->bill->update(['status' => 'waived']);

    expect(fn () => $this->service->processRentPayment($this->bill->fresh(), 5000))
        ->toThrow(InvalidArgumentException::class);
});

// --- waiveRentBill ---

test('waiveRentBill sets status to waived and amount_paid to amount_due', function () {
    $this->service->waiveRentBill($this->bill);

    $fresh = $this->bill->fresh();
    expect($fresh->status)->toBe('waived')
        ->and($fresh->amount_paid)->toEqual($fresh->amount_due);
});

test('waiveRentBill appends notes when provided', function () {
    $this->service->waiveRentBill($this->bill, 'Goodwill gesture');

    expect($this->bill->fresh()->notes)->toContain('Waived: Goodwill gesture');
});

// --- getCurrentMonthBill ---

test('getCurrentMonthBill returns the bill for the current month', function () {
    $found = $this->service->getCurrentMonthBill($this->tenancy->id);

    expect($found?->id)->toBe($this->bill->id);
});

test('getCurrentMonthBill returns null when no current-month bill exists', function () {
    $this->bill->update(['billing_month' => now()->subMonth()->startOfMonth()]);

    expect($this->service->getCurrentMonthBill($this->tenancy->id))->toBeNull();
});

// --- getPendingBills ---

test('getPendingBills returns pending partial and overdue bills excluding paid', function () {
    RentBill::factory()->create([
        'tenancy_id'    => $this->tenancy->id,
        'status'        => 'partial',
        'billing_month' => now()->subMonth()->startOfMonth(),
        'due_date'      => now()->subMonth()->endOfMonth(),
    ]);
    RentBill::factory()->create([
        'tenancy_id'    => $this->tenancy->id,
        'status'        => 'paid',
        'billing_month' => now()->subMonths(2)->startOfMonth(),
        'due_date'      => now()->subMonths(2)->endOfMonth(),
    ]);

    $results = $this->service->getPendingBills($this->tenancy->id);

    expect($results)->toHaveCount(2)
        ->and($results->pluck('status')->contains('paid'))->toBeFalse();
});

// --- linkPaymentToBill ---

test('linkPaymentToBill resolves explicit bill ID belonging to tenancy', function () {
    $result = $this->service->linkPaymentToBill($this->tenancy->id, $this->bill->id);

    expect($result['rent_bill_id'])->toBe($this->bill->id)
        ->and($result['error'])->toBeNull();
});

test('linkPaymentToBill returns error for bill not belonging to tenancy', function () {
    $otherTenancy = Tenancy::factory()->create();
    $otherBill    = RentBill::factory()->create([
        'tenancy_id'    => $otherTenancy->id,
        'status'        => 'pending',
        'billing_month' => now()->startOfMonth(),
        'due_date'      => now()->endOfMonth(),
    ]);

    $result = $this->service->linkPaymentToBill($this->tenancy->id, $otherBill->id);

    expect($result['rent_bill_id'])->toBeNull()
        ->and($result['error'])->not->toBeNull();
});

test('linkPaymentToBill returns error for already paid bill', function () {
    $this->bill->update(['status' => 'paid']);

    $result = $this->service->linkPaymentToBill($this->tenancy->id, $this->bill->id);

    expect($result['error'])->not->toBeNull();
});

test('linkPaymentToBill auto-finds current month bill when no ID given', function () {
    $result = $this->service->linkPaymentToBill($this->tenancy->id, null);

    expect($result['rent_bill_id'])->toBe($this->bill->id);
});

test('linkPaymentToBill returns null rent_bill_id when required is false and no bill', function () {
    $this->bill->update(['billing_month' => now()->subMonth()->startOfMonth()]);

    $result = $this->service->linkPaymentToBill($this->tenancy->id, null, false);

    expect($result['rent_bill_id'])->toBeNull()
        ->and($result['error'])->toBeNull();
});

test('linkPaymentToBill returns error when required is true and no current bill', function () {
    $this->bill->update(['billing_month' => now()->subMonth()->startOfMonth()]);

    $result = $this->service->linkPaymentToBill($this->tenancy->id, null, true);

    expect($result['error'])->not->toBeNull();
});

// --- createPaymentWithRentBill ---

test('createPaymentWithRentBill creates payment and marks rent bill paid atomically', function () {
    $payment = $this->service->createPaymentWithRentBill(
        [
            'tenant_id'      => $this->tenant->id,
            'tenancy_id'     => $this->tenancy->id,
            'amount'         => 20000,
            'payment_type'   => 'rent',
            'payment_method' => 'bank_transfer',
            'status'         => 'pending',
            'paid_at'        => now(),
        ],
        $this->bill->id,
        20000
    );

    expect($payment->id)->not->toBeNull()
        ->and($this->bill->fresh()->status)->toBe('paid');
});

// --- getRentStatistics ---

test('getRentStatistics returns correct counts grouped by status', function () {
    // Already have one pending bill from beforeEach.
    RentBill::factory()->create([
        'tenancy_id'    => $this->tenancy->id,
        'status'        => 'paid',
        'amount_due'    => 20000,
        'amount_paid'   => 20000,
        'billing_month' => now()->subMonth()->startOfMonth(),
        'due_date'      => now()->subMonth()->endOfMonth(),
    ]);

    $stats = $this->service->getRentStatistics($this->landlord);

    expect($stats['total'])->toBe(2)
        ->and($stats['paid'])->toBe(1);
});

// --- getRentBillList ---

test('getRentBillList filters by status', function () {
    $request = \Illuminate\Http\Request::create('/', 'GET', ['status' => 'pending']);

    $result = $this->service->getRentBillList($this->landlord, $request);

    expect($result['rent_bills']->total())->toBeGreaterThanOrEqual(1)
        ->and($result['filters']['status'])->toBe('pending');
});

test('getRentBillList searches by tenant name substring', function () {
    $request = \Illuminate\Http\Request::create('/', 'GET', ['search' => $this->tenant->full_name]);

    $result = $this->service->getRentBillList($this->landlord, $request);

    expect($result['rent_bills']->total())->toBeGreaterThanOrEqual(1);
});
