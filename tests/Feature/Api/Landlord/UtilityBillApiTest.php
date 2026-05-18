<?php

use App\Models\Payment;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    [
        'user' => $this->landlord,
        'property' => $this->property,
        'unit' => $this->unit,
    ] = $this->createApiLandlord();

    // Create a tenant and tenancy for the unit
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
    ]);

    $this->utilityType = UtilityType::factory()->create(['is_active' => true]);
    $this->tu = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'status' => 'active',
    ]);
});

test('landlord can list utility bills for their properties', function () {
    UtilityBill::factory()->count(3)->create([
        'tenancy_utility_id' => $this->tu->id,
    ]);

    $this->getJson('/api/v1/landlord/utility-bills')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'billing_month',
                    'amount_due',
                    'status',
                ],
            ],
            'meta',
        ]);
});

test('landlord utility bill listing handles payments without lazy loading errors', function () {
    $bill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $this->tu->id,
    ]);

    // Create a payment for this bill
    Payment::factory()->create([
        'utility_bill_id' => $bill->id,
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
    ]);

    // This should NOT throw a 500 error
    $this->getJson('/api/v1/landlord/utility-bills')
        ->assertOk();
});
