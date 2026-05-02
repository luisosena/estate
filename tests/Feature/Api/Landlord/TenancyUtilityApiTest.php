<?php

use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();

    $tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'unit_id' => $this->unit->id,
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);

    $this->utilityType = UtilityType::factory()->create(['name' => 'Water', 'unit' => 'm³']);
    $this->utility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'amount' => 500,
        'billing_cycle' => 'monthly',
        'status' => 'active',
    ]);
});

test('landlord can show a tenancy utility with flat fields', function () {
    $response = $this->getJson("/api/v1/landlord/tenancy-utilities/{$this->utility->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.id', $this->utility->id)
        ->assertJsonPath('data.tenancy_id', $this->tenancy->id)
        ->assertJsonPath('data.unit_id', $this->unit->id)
        ->assertJsonPath('data.unit_code', $this->unit->unit_code)
        ->assertJsonPath('data.property_id', $this->property->id)
        ->assertJsonPath('data.property_name', $this->property->name)
        ->assertJsonMissingPath('data.tenancy');
});

test('landlord can update a tenancy utility and receives full record', function () {
    $response = $this->putJson("/api/v1/landlord/tenancy-utilities/{$this->utility->id}", [
        'amount' => 750,
        'status' => 'active',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.id', $this->utility->id)
        ->assertJsonPath('data.amount', '750.00')
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'tenancy_id',
                'utility_type_id',
                'utility_type',
                'amount',
                'billing_cycle',
                'provider',
                'account_number',
                'meter_number',
                'status',
                'notes',
                'created_at',
                'updated_at',
            ],
        ]);
});
