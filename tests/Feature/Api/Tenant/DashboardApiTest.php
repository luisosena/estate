<?php

use App\Models\Payment;
use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('tenant dashboard returns structured data', function () {
    $property = Property::factory()->create();
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'role' => 'tenant',
        'tenant_id' => $tenant->id,
    ]);

    $tenancy = Tenancy::factory()->create([
        'tenant_id' => $tenant->id,
        'unit_id' => $unit->id,
        'status' => 'active',
    ]);

    Payment::factory()->count(3)->create([
        'tenant_id' => $tenant->id,
        'tenancy_id' => $tenancy->id,
    ]);

    RentBill::factory()->create([
        'tenancy_id' => $tenancy->id,
        'billing_month' => now()->startOfMonth(),
    ]);

    $response = $this->actingAs($user)->getJson('/api/tenant/dashboard');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'tenant' => ['id', 'full_name', 'email'],
            'unit' => ['id', 'unit_name', 'property' => ['id', 'name']],
            'tenancy' => ['id', 'move_in_date', 'status', 'monthly_rent'],
            'payments',
            'rent_bills',
            'current_month_bill',
        ]);
});

test('tenant dashboard handles missing tenancy gracefully', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create([
        'role' => 'tenant',
        'tenant_id' => $tenant->id,
    ]);

    $response = $this->actingAs($user)->getJson('/api/tenant/dashboard');

    $response->assertStatus(200)
        ->assertJsonPath('unit', null)
        ->assertJsonPath('tenancy', null);
});
