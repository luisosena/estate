<?php

use App\Enums\BillStatus;
use App\Models\Payment;
use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id]);
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'unit_id' => $this->unit->id,
        'tenant_id' => $this->tenant->id,
        'status' => 'active',
        'monthly_rent' => 150000,
    ]);
});

test('landlord can record a single-bill payment', function () {
    $bill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-04-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-04-30'),
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 150000,
            'payment_method' => 'mobile_money',
            'rent_bill_ids' => [$bill->id],
        ])
        ->assertRedirect(route('landlord.tenants.show', ['tenant' => $this->tenant->tenant_code]));

    $this->assertDatabaseCount('payments', 1);
    $payment = Payment::first();
    expect($payment->tenant_id)->toBe($this->tenant->id)
        ->and((float) $payment->amount)->toBe(150000.0)
        ->and($payment->recorded_by)->toBe($this->landlord->id)
        ->and($payment->status->value)->toBe('paid');

    $bill->refresh();
    expect($bill->status)->toBe(BillStatus::Paid);
});

test('landlord can record a multi-bill payment with sequential allocation', function () {
    $aprBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-04-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-04-30'),
        'status' => 'pending',
    ]);
    $mayBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-05-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-05-31'),
        'status' => 'pending',
    ]);
    $junBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-06-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-06-30'),
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 300000,
            'payment_method' => 'bank_transfer',
            'rent_bill_ids' => [$aprBill->id, $mayBill->id, $junBill->id],
        ])
        ->assertRedirect();

    // Apr fully paid, May fully paid, Jun not touched
    $aprBill->refresh();
    $mayBill->refresh();
    $junBill->refresh();

    expect($aprBill->status)->toBe(BillStatus::Paid)
        ->and((float) $aprBill->amount_paid)->toBe(150000.0)
        ->and($mayBill->status)->toBe(BillStatus::Paid)
        ->and((float) $mayBill->amount_paid)->toBe(150000.0)
        ->and($junBill->status)->toBe(BillStatus::Pending)
        ->and((float) $junBill->amount_paid)->toBe(0.0);

    // 2 payment records (one per bill that received money)
    $this->assertDatabaseCount('payments', 2);
});

test('overpayment is allocated to the last bill', function () {
    $aprBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-04-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-04-30'),
        'status' => 'pending',
    ]);
    $mayBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-05-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-05-31'),
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 350000,
            'payment_method' => 'mobile_money',
            'rent_bill_ids' => [$aprBill->id, $mayBill->id],
        ])
        ->assertRedirect();

    $aprBill->refresh();
    $mayBill->refresh();

    expect($aprBill->status)->toBe(BillStatus::Paid)
        ->and((float) $aprBill->amount_paid)->toBe(150000.0)
        ->and($mayBill->status)->toBe(BillStatus::Paid)
        ->and((float) $mayBill->amount_paid)->toBe(200000.0);

    $this->assertDatabaseCount('payments', 2);
    $lastPayment = Payment::orderBy('id', 'desc')->first();
    expect((float) $lastPayment->amount)->toBe(200000.0);
});

test('on-demand bill creation when no bills exist', function () {
    // No existing rent bills
    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 150000,
            'payment_method' => 'mobile_money',
            'billing_months' => ['2026-06'],
        ])
        ->assertRedirect();

    // Rent bill was created
    $this->assertDatabaseCount('rent_bills', 1);
    $bill = RentBill::first();
    expect($bill->tenancy_id)->toBe($this->tenancy->id)
        ->and($bill->billing_month->format('Y-m'))->toBe('2026-06')
        ->and((float) $bill->amount_due)->toBe(150000.0);

    // Payment was created
    $this->assertDatabaseCount('payments', 1);
});

test('mixed existing and on-demand bills', function () {
    $aprBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-04-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-04-30'),
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 300000,
            'payment_method' => 'bank_transfer',
            'rent_bill_ids' => [$aprBill->id],
            'billing_months' => ['2026-05'],
        ])
        ->assertRedirect();

    // May bill was auto-created
    $this->assertDatabaseCount('rent_bills', 2);
    $mayBill = RentBill::where('billing_month', Carbon::parse('2026-05-01'))->first();
    expect($mayBill)->not->toBeNull();

    // Both bills processed
    $aprBill->refresh();
    $mayBill->refresh();
    expect($aprBill->status)->toBe(BillStatus::Paid)
        ->and($mayBill->status)->toBe(BillStatus::Paid);
});

test('cannot record against already-paid bill', function () {
    $paidBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-04-01'),
        'amount_due' => 150000,
        'amount_paid' => 150000,
        'due_date' => Carbon::parse('2026-04-30'),
        'status' => 'paid',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 150000,
            'payment_method' => 'mobile_money',
            'rent_bill_ids' => [$paidBill->id],
        ])
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('non-landlord cannot record payment', function () {
    $tenantUser = User::factory()->create(['role' => 'tenant']);

    actingAs($tenantUser)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 150000,
            'payment_method' => 'mobile_money',
            'rent_bill_ids' => [1],
        ])
        ->assertForbidden();
});

test('validation: amount required and positive', function (array $payload, string $errorField) {
    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), $payload)
        ->assertSessionHasErrors($errorField);
})->with([
    'zero amount' => [['amount' => 0, 'payment_method' => 'mobile_money', 'rent_bill_ids' => [1]], 'amount'],
    'negative amount' => [['amount' => -100, 'payment_method' => 'mobile_money', 'rent_bill_ids' => [1]], 'amount'],
    'no amount' => [['payment_method' => 'mobile_money', 'rent_bill_ids' => [1]], 'amount'],
]);

test('validation: only mobile_money and bank_transfer allowed', function (string $method) {
    $bill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-04-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-04-30'),
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 150000,
            'payment_method' => $method,
            'rent_bill_ids' => [$bill->id],
        ])
        ->assertSessionHasErrors('payment_method');
})->with(['cash', 'mpesa', 'card']);

test('recorded_by is set correctly', function () {
    $bill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => Carbon::parse('2026-04-01'),
        'amount_due' => 150000,
        'amount_paid' => 0,
        'due_date' => Carbon::parse('2026-04-30'),
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.record', ['tenant' => $this->tenant->tenant_code]), [
            'amount' => 150000,
            'payment_method' => 'mobile_money',
            'rent_bill_ids' => [$bill->id],
        ])
        ->assertRedirect();

    $payment = Payment::first();
    expect($payment->recorded_by)->toBe($this->landlord->id);
});

test('search extension: find tenant by unit code', function () {
    $this->unit->update(['unit_code' => 'UNIT-001']);

    actingAs($this->landlord)
        ->get(route('landlord.tenants.index', ['search' => 'UNIT-001']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('landlord/tenants/index')
            ->has('tenants.data', 1)
        );
});
