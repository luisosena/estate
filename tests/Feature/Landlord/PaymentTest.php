<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

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
    ]);
});

test('guest is redirected from payment index', function () {
    get(route('landlord.payments.index'))->assertRedirect(route('login'));
});

test('landlord can view payment index', function () {
    actingAs($this->landlord)
        ->get(route('landlord.payments.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/payments/index'));
});

test('landlord can record a payment for their tenant', function () {
    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.store', $this->tenant), [
            'amount' => 15000,
            'payment_type' => 'rent',
            'payment_method' => 'mpesa',
            'status' => 'paid',
            'paid_at' => now()->toDateString(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('payments', [
        'tenant_id' => $this->tenant->id,
        'amount' => 15000,
        'payment_type' => 'rent',
    ]);
});

test('payment store fails without required fields', function (string $field) {
    $payload = [
        'amount' => 15000,
        'payment_type' => 'rent',
        'payment_method' => 'mpesa',
        'status' => 'paid',
        'paid_at' => now()->toDateString(),
    ];

    unset($payload[$field]);

    actingAs($this->landlord)
        ->post(route('landlord.tenants.payments.store', $this->tenant), $payload)
        ->assertSessionHasErrors($field);
})->with(['amount', 'payment_type', 'payment_method', 'status', 'paid_at']);

test('non-landlord cannot record payment', function () {
    $otherUser = User::factory()->create(['role' => 'tenant']);

    actingAs($otherUser)
        ->post(route('landlord.tenants.payments.store', $this->tenant), [
            'amount' => 15000,
            'payment_type' => 'rent',
            'payment_method' => 'mpesa',
            'status' => 'paid',
            'paid_at' => now()->toDateString(),
        ])
        ->assertForbidden();
});
