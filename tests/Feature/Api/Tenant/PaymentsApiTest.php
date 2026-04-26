<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    [
        'user'    => $this->user,
        'tenant'  => $this->tenant,
        'tenancy' => $this->tenancy,
    ] = $this->createApiTenant();
});

test('tenant can list own payments', function () {
    $this->getJson('/api/v1/tenant/payments')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                'payments',
            ],
        ]);
});

test('tenant can record a rent payment', function () {
    $response = $this->postJson('/api/v1/tenant/payments', [
        'amount'         => 15000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('payments', [
        'tenant_id'    => $this->tenant->id,
        'payment_type' => 'rent',
        'amount'       => 15000,
    ]);
});

test('payment creation fails without required fields', function () {
    $this->postJson('/api/v1/tenant/payments', [])->assertUnprocessable();
});

test('payment is rejected when tenant has no active tenancy', function () {
    $this->tenancy->update(['status' => 'ended']);

    $this->postJson('/api/v1/tenant/payments', [
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
    ])->assertUnprocessable();
});
