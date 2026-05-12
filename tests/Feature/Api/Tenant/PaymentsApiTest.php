<?php

use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    [
        'user' => $this->user,
        'tenant' => $this->tenant,
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
        'amount' => 15000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('payments', [
        'tenant_id' => $this->tenant->id,
        'payment_type' => 'rent',
        'amount' => 15000,
    ]);
});

test('payment creation fails without required fields', function () {
    $this->postJson('/api/v1/tenant/payments', [])->assertUnprocessable();
});

test('payment is rejected when tenant has no active tenancy', function () {
    $this->tenancy->update(['status' => 'ended']);

    $this->postJson('/api/v1/tenant/payments', [
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
    ])->assertUnprocessable();
});

test('tenant can download their own payment receipt', function () {
    $payment = Payment::create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 5000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $response = $this->getJson("/api/v1/tenant/payments/{$payment->id}/receipt");

    $response->assertOk()
        ->assertJsonStructure(['data' => ['url']]);
});

test('tenant cannot download another tenants receipt', function () {
    $otherTenant = Tenant::factory()->create();
    $otherTenancy = Tenancy::factory()->create([
        'tenant_id' => $otherTenant->id,
        'unit_id' => $this->tenancy->unit_id,
    ]);
    $otherPayment = Payment::create([
        'tenant_id' => $otherTenant->id,
        'tenancy_id' => $otherTenancy->id,
        'amount' => 1000,
        'payment_type' => 'rent',
        'payment_method' => 'mobile_money',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $this->getJson("/api/v1/tenant/payments/{$otherPayment->id}/receipt")
        ->assertForbidden();
});

test('tenant receipt returns 400 for unpaid payment', function () {
    $payment = Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'pending',
        'paid_at'        => null,
    ]);

    $this->getJson("/api/v1/tenant/payments/{$payment->id}/receipt")
        ->assertStatus(400)
        ->assertJson(['message' => 'Receipt not available for unpaid payments.']);
});

test('tenant receipt returns 500 when generation fails', function () {
    $payment = Payment::create([
        'tenant_id'      => $this->tenant->id,
        'tenancy_id'     => $this->tenancy->id,
        'amount'         => 5000,
        'payment_type'   => 'rent',
        'payment_method' => 'mobile_money',
        'status'         => 'paid',
        'paid_at'        => now(),
    ]);

    $this->mock(\App\Services\ReceiptService::class, function ($mock) {
        $mock->shouldReceive('generate')->andThrow(new \RuntimeException('PDF engine failure'));
        $mock->shouldReceive('getUrl')->andReturn(null);
    });

    $this->getJson("/api/v1/tenant/payments/{$payment->id}/receipt")
        ->assertStatus(500)
        ->assertJson(['message' => 'Failed to generate receipt.']);
});
