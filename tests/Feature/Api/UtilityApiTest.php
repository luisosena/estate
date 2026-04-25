<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id]);
    $this->tenant = Tenant::factory()->create();
    $this->tenantUser = User::factory()->create([
        'role' => 'tenant',
        'tenant_id' => $this->tenant->id,
    ]);
    $this->tenancy = Tenancy::factory()->create([
        'unit_id' => $this->unit->id,
        'tenant_id' => $this->tenant->id,
        'status' => 'active',
    ]);
    $this->utilityType = UtilityType::factory()->create();
});

test('landlord can list utility bills with nested tenancy_utility', function () {
    Sanctum::actingAs($this->landlord);
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    UtilityBill::factory()->count(2)->create(['tenancy_utility_id' => $tenancyUtility->id]);

    $response = $this->getJson('/api/landlord/utility-bills');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'tenancy_utility' => [
                        'utility_type' => [
                            'name',
                        ],
                        'tenancy' => [
                            'unit' => [
                                'unit_code',
                                'property' => [
                                    'name',
                                ],
                            ],
                            'tenant' => [
                                'full_name',
                            ],
                        ],
                    ],
                    'amount_due',
                    'status',
                ],
            ],
            'meta',
        ]);
});

test('tenant can list their utilities with nested utility_type', function () {
    Sanctum::actingAs($this->tenantUser);
    TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);

    $response = $this->getJson('/api/tenant/utilities');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'utility_type' => [
                        'name',
                        'unit',
                    ],
                    'amount',
                    'status',
                ],
            ],
            'meta' => [
                'tenancy_id',
                'monthly_rent',
            ],
        ]);
});

test('tenant can list their utility bills with nested tenancy_utility', function () {
    Sanctum::actingAs($this->tenantUser);
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    UtilityBill::factory()->create(['tenancy_utility_id' => $tenancyUtility->id]);

    $response = $this->getJson('/api/tenant/utility-bills');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'tenancy_utility' => [
                        'utility_type' => [
                            'name',
                        ],
                        'tenancy' => [
                            'unit' => [
                                'unit_code',
                            ],
                            'tenant' => [
                                'full_name',
                            ],
                        ],
                    ],
                    'billing_month',
                    'amount_due',
                    'status',
                    'provider',
                ],
            ],
            'meta' => [
                'total_due',
                'total_outstanding',
            ],
        ]);
});
