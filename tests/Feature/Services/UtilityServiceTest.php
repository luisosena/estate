<?php

use App\Enums\BillStatus;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use App\Services\UtilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new UtilityService;
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'occupied']);
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
        'monthly_rent' => 15000,
    ]);
    $this->utilityType = UtilityType::factory()->create(['is_active' => true]);
});

// --- assignUtilityToTenancy ---

test('assignUtilityToTenancy creates a TenancyUtility record', function () {
    $tenancyUtility = $this->service->assignUtilityToTenancy($this->tenancy, [
        'utility_type_id' => $this->utilityType->id,
        'amount' => 2500,
        'billing_cycle' => 'monthly',
    ]);

    expect($tenancyUtility->id)->not->toBeNull()
        ->and($tenancyUtility->tenancy_id)->toBe($this->tenancy->id)
        ->and($tenancyUtility->utility_type_id)->toBe($this->utilityType->id);

    $this->assertDatabaseHas('tenancy_utilities', ['id' => $tenancyUtility->id]);
});

test('assignUtilityToTenancy defaults billing_cycle to monthly when omitted', function () {
    $tenancyUtility = $this->service->assignUtilityToTenancy($this->tenancy, [
        'utility_type_id' => $this->utilityType->id,
        'amount' => 1000,
    ]);

    expect($tenancyUtility->billing_cycle)->toBe('monthly');
});

// --- removeUtilityFromTenancy ---

test('removeUtilityFromTenancy deletes record when no unpaid bills exist', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);

    $this->service->removeUtilityFromTenancy($tenancyUtility);

    $this->assertDatabaseMissing('tenancy_utilities', ['id' => $tenancyUtility->id]);
});

test('removeUtilityFromTenancy throws RuntimeException when pending bills exist', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    UtilityBill::factory()->create([
        'tenancy_utility_id' => $tenancyUtility->id,
        'status' => 'pending',
    ]);

    expect(fn () => $this->service->removeUtilityFromTenancy($tenancyUtility))
        ->toThrow(RuntimeException::class);
});

test('removeUtilityFromTenancy throws RuntimeException when partial bills exist', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    UtilityBill::factory()->create([
        'tenancy_utility_id' => $tenancyUtility->id,
        'status' => 'partial',
    ]);

    expect(fn () => $this->service->removeUtilityFromTenancy($tenancyUtility))
        ->toThrow(RuntimeException::class);
});

// --- getPendingBillsForTenant ---

test('getPendingBillsForTenant returns pending bills for tenant with active tenancy', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    UtilityBill::factory()->create([
        'tenancy_utility_id' => $tenancyUtility->id,
        'status' => 'pending',
    ]);
    UtilityBill::factory()->create([
        'tenancy_utility_id' => $tenancyUtility->id,
        'status' => 'paid',
    ]);

    $bills = $this->service->getPendingBillsForTenant($this->tenant);

    expect($bills)->toHaveCount(1)
        ->and($bills->first()->status)->toBe(BillStatus::Pending);
});

test('getPendingBillsForTenant returns empty collection when no active tenancy', function () {
    $tenant = Tenant::factory()->create();
    $endedTenancy = Tenancy::factory()->create(['tenant_id' => $tenant->id, 'status' => 'ended']);

    $bills = $this->service->getPendingBillsForTenant($tenant);

    expect($bills)->toBeEmpty();
});

// --- calculateTotalMonthlyUtilities ---

test('calculateTotalMonthlyUtilities sums only active monthly utilities', function () {
    TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'amount' => 1000,
        'billing_cycle' => 'monthly',
        'status' => 'active',
    ]);
    TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => UtilityType::factory()->create(['is_active' => true])->id,
        'amount' => 5000,
        'billing_cycle' => 'monthly',
        'status' => 'suspended',
    ]);

    $total = $this->service->calculateTotalMonthlyUtilities($this->tenancy);

    expect($total)->toBe(1000.0);
});

test('calculateTotalMonthlyUtilities excludes quarterly and annual billing cycles', function () {
    TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'amount' => 3000,
        'billing_cycle' => 'quarterly',
        'status' => 'active',
    ]);

    $total = $this->service->calculateTotalMonthlyUtilities($this->tenancy);

    expect($total)->toBe(0.0);
});

// --- getUtilitiesSummary ---

test('getUtilitiesSummary normalises quarterly bills to monthly equivalent', function () {
    TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'amount' => 3000,
        'billing_cycle' => 'quarterly',
        'status' => 'active',
    ]);

    $summary = $this->service->getUtilitiesSummary($this->tenancy);

    expect($summary['quarterly_total'])->toBe(1000.0) // 3000 / 3
        ->and($summary['total_monthly'])->toBe(1000.0);
});

// --- getBillsForTenant ---

test('getBillsForTenant returns empty stats when no active tenancy', function () {
    $tenant = Tenant::factory()->create();
    Tenancy::factory()->create(['tenant_id' => $tenant->id, 'status' => 'ended']);

    $result = $this->service->getBillsForTenant($tenant);

    expect($result['bills'])->toBeEmpty()
        ->and($result['total'])->toBe(0);
});

test('getBillsForTenant filters by status', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    UtilityBill::factory()->create(['tenancy_utility_id' => $tenancyUtility->id, 'status' => 'paid', 'amount_due' => 1000, 'amount_paid' => 1000]);
    UtilityBill::factory()->create(['tenancy_utility_id' => $tenancyUtility->id, 'status' => 'pending', 'amount_due' => 2000, 'amount_paid' => 0]);

    $result = $this->service->getBillsForTenant($this->tenant, ['status' => 'paid']);

    expect($result['bills'])->toHaveCount(1)
        ->and($result['bills']->first()->status)->toBe(BillStatus::Paid);
});

// --- processUtilityPayment ---

test('processUtilityPayment marks utility bill as paid on full payment', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    $bill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $tenancyUtility->id,
        'amount_due' => 2000,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);

    $this->service->processUtilityPayment($bill, 2000);

    expect($bill->fresh()->status)->toBe(BillStatus::Paid);
});

test('processUtilityPayment marks utility bill as partial on underpayment', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    $bill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $tenancyUtility->id,
        'amount_due' => 2000,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);

    $this->service->processUtilityPayment($bill, 1000);

    expect($bill->fresh()->status)->toBe(BillStatus::Partial);
});
