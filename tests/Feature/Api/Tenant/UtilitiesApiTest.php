<?php

use App\Models\TenancyUtility;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    [
        'user' => $this->user,
        'tenant' => $this->tenant,
        'tenancy' => $this->tenancy,
    ] = $this->createApiTenant();

    $this->utilityType = UtilityType::factory()->create(['is_active' => true]);
    $this->tu = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'amount' => 2000,
        'billing_cycle' => 'monthly',
        'status' => 'active',
    ]);
});

test('tenant can list own utility subscriptions', function () {
    $this->getJson('/api/v1/tenant/utilities')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta' => ['tenancy_id', 'monthly_rent']]);
});

test('tenant can list own utility bills', function () {
    UtilityBill::factory()->create([
        'tenancy_utility_id' => $this->tu->id,
        'status' => 'pending',
    ]);

    $this->getJson('/api/v1/tenant/utility-bills')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('utility data is scoped to the active tenancy', function () {
    $response = $this->getJson('/api/v1/tenant/utilities')->assertOk();

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids->contains($this->tu->id))->toBeTrue();
});

test('tenant with no active tenancy gets empty utility response', function () {
    $this->tenancy->update(['status' => 'ended']);

    $response = $this->getJson('/api/v1/tenant/utilities')->assertOk();

    expect($response->json('data'))->toBeEmpty();
});
