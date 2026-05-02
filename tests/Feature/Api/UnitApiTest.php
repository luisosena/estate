<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    Sanctum::actingAs($this->landlord);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
});

test('landlord can list their units with data wrapper and flattened fields', function () {
    Unit::factory()->count(3)->create(['property_id' => $this->property->id]);

    $response = $this->getJson('/api/v1/landlord/units');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'unit_code',
                    'unit_name',
                    'status',
                    'property_id',
                    'property_name',
                    'created_at',
                    'updated_at',
                ],
            ],
            'meta',
            'stats',
        ]);
});

test('landlord can show a unit with data wrapper and flattened fields', function () {
    $unit = Unit::factory()->create(['property_id' => $this->property->id]);

    $response = $this->getJson("/api/v1/landlord/units/{$unit->id}");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'unit_code',
                'unit_name',
                'status',
                'property_id',
                'property_name',
                'property_address',
                'created_at',
                'updated_at',
                'tenancies',
            ],
        ]);
});

test('unit show tenancy dates use move_in_date and move_out_date field names', function () {
    $tenant = Tenant::factory()->create();
    $tenantUser = User::factory()->create(['role' => 'tenant', 'tenant_id' => $tenant->id]);
    $unit = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'occupied']);
    Tenancy::factory()->create([
        'unit_id' => $unit->id,
        'tenant_id' => $tenant->id,
        'move_in_date' => '2026-01-01',
        'status' => 'active',
    ]);

    $response = $this->getJson("/api/v1/landlord/units/{$unit->id}");

    $tenancies = $response->assertStatus(200)->json('data.tenancies');
    expect($tenancies)->not->toBeEmpty();
    expect($tenancies[0])->toHaveKey('move_in_date')
        ->not->toHaveKey('start_date')
        ->not->toHaveKey('end_date');
    expect($tenancies[0]['move_in_date'])->toStartWith('2026-01-01');
});

test('landlord can store a unit with data wrapper', function () {
    $data = [
        'property_id' => $this->property->id,
        'unit_code' => 'UNIT-XYZ',
        'unit_name' => 'Unit XYZ',
    ];

    $response = $this->postJson('/api/v1/landlord/units', $data);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'unit_code',
                'unit_name',
                'status',
                'property_id',
                'created_at',
                'updated_at',
            ],
        ]);
});

test('landlord can update a unit with data wrapper', function () {
    $unit = Unit::factory()->create(['property_id' => $this->property->id]);

    $data = [
        'unit_name' => 'Updated Unit Name',
    ];

    $response = $this->putJson("/api/v1/landlord/units/{$unit->id}", $data);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'unit_code',
                'unit_name',
                'status',
                'created_at',
                'updated_at',
            ],
        ]);
});
