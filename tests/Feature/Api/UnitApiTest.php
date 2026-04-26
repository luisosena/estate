<?php

use App\Models\Property;
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
                ]
            ],
            'meta',
            'stats'
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
                'tenancies'
            ]
        ]);
});

test('landlord can store a unit with data wrapper', function () {
    $data = [
        'property_id' => $this->property->id,
        'unit_code' => 'UNIT-XYZ',
        'unit_name' => 'Unit XYZ'
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
            ]
        ]);
});

test('landlord can update a unit with data wrapper', function () {
    $unit = Unit::factory()->create(['property_id' => $this->property->id]);

    $data = [
        'unit_name' => 'Updated Unit Name'
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
                'updated_at',
            ]
        ]);
});
