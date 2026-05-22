<?php

use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit] = $this->createApiLandlord();

    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
    ]);

    $this->rentBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'billing_month' => now()->startOfMonth(),
        'amount_due' => 1500,
        'amount_paid' => 0,
        'status' => 'pending',
    ]);
});

test('landlord can list rent bills with nested structure', function () {
    $this->getJson('/api/v1/landlord/rent-bills')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'billing_month',
                    'amount_due',
                    'amount_paid',
                    'outstanding_amount',
                    'due_date',
                    'status',
                    'tenant' => ['id', 'full_name', 'tenant_code', 'phone', 'email'],
                    'unit' => ['id', 'unit_code'],
                    'property' => ['id', 'name'],
                ],
            ],
            'meta' => ['current_page', 'per_page', 'total', 'last_page'],
        ]);
});

test('landlord can view single rent bill with nested structure', function () {
    $this->getJson("/api/v1/landlord/rent-bills/{$this->rentBill->id}")
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                'id',
                'billing_month',
                'amount_due',
                'amount_paid',
                'outstanding_amount',
                'due_date',
                'status',
                'tenant' => ['id', 'full_name', 'tenant_code', 'phone', 'email'],
                'unit' => ['id', 'unit_code'],
                'property' => ['id', 'name'],
                'payments',
            ],
        ]);
});
