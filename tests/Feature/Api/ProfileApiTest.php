<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('landlord can get their profile with data wrapper', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);
    Sanctum::actingAs($landlord);

    $response = $this->getJson('/api/v1/landlord/profile');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'email',
                'role',
            ]
        ]);
});

test('tenant can get their profile with data wrapper', function () {
    $tenant = Tenant::factory()->create();
    $tenantUser = User::factory()->create([
        'role' => 'tenant',
        'tenant_id' => $tenant->id
    ]);
    Sanctum::actingAs($tenantUser);

    $response = $this->getJson('/api/v1/tenant/profile');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'email',
                'tenant' => [
                    'id',
                    'tenant_code',
                ]
            ]
        ]);
});

test('landlord can update their profile with data wrapper', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);
    Sanctum::actingAs($landlord);

    $data = [
        'name' => 'Updated Name',
        'email' => 'updated@example.com'
    ];

    $response = $this->putJson('/api/v1/landlord/profile', $data);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'name',
                'email',
            ]
        ]);
});
