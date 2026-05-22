<?php

use App\Enums\BillStatus;
use App\Models\TenancyUtility;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tu = TenancyUtility::factory()->create(['status' => 'active']);
    $this->bill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $this->tu->id,
        'amount_due' => 3000,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);
});

test('markPaid sets status to paid on full payment', function () {
    $this->bill->markPaid(3000);

    expect($this->bill->fresh()->status)->toBe(BillStatus::Paid)
        ->and($this->bill->fresh()->amount_paid)->toEqual('3000.00');
});

test('markPaid sets status to partial on underpayment', function () {
    $this->bill->markPaid(1500);

    expect($this->bill->fresh()->status)->toBe(BillStatus::Partial)
        ->and($this->bill->fresh()->amount_paid)->toEqual('1500.00');
});

test('utility bill belongs to tenancy utility', function () {
    expect($this->bill->tenancyUtility)->not->toBeNull()
        ->and($this->bill->tenancyUtility->id)->toBe($this->tu->id);
});

test('tenancy utility belongs to utility type', function () {
    expect($this->tu->utilityType)->not->toBeNull()
        ->and($this->tu->utilityType)->toBeInstanceOf(UtilityType::class);
});
