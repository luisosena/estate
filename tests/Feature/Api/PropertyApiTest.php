<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    Sanctum::actingAs($this->landlord);
});

test('landlord can list their properties with data wrapper', function () {
    Property::factory()->count(3)->create(['owner_id' => $this->landlord->id]);

    $response = $this->getJson('/api/landlord/properties');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'address',
                    'property_type',
                    'total_units',
                    'created_at',
                ]
            ],
            'meta',
            'stats'
        ]);
});

test('landlord can show a property with data wrapper', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id]);

    $response = $this->getJson("/api/landlord/properties/{$property->id}");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'address',
                'property_type',
                'total_units',
                'created_at',
            ]
        ]);
});

test('landlord can store a property with data wrapper', function () {
    $data = [
        'name' => 'New Property',
        'address' => '123 Test St',
        'property_type' => 'apartment',
        'description' => 'A test property'
    ];

    $response = $this->postJson('/api/landlord/properties', $data);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'name',
                'address',
                'property_type',
                'total_units',
                'created_at',
            ]
        ]);
});

test('landlord can update a property with data wrapper', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id]);

    $data = [
        'name' => 'Updated Property'
    ];

    $response = $this->putJson("/api/landlord/properties/{$property->id}", $data);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'name',
                'address',
                'updated_at',
            ]
        ]);
});
