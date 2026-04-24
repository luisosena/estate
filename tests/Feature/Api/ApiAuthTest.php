<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('allows login via /api/v1/auth/login and authenticates subsequent requests with bearer token', function () {
    $password = 'password';

    $tenant = Tenant::create([
        'full_name' => 'Test Tenant',
        'phone' => '0000000000',
        'email' => 'tenant@example.com',
        'emergency_contact_name' => 'Emergency Contact',
        'emergency_contact_phone' => '1111111111',
        'emergency_contact_relation' => 'Friend',
    ]);

    $user = User::factory()->create([
        'password' => $password,
        'role' => 'tenant',
        'tenant_id' => $tenant->id,
    ]);

    // 1. Test Login
    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'username' => $user->username,
        'password' => $password,
    ]);

    $loginResponse->assertOk();
    $loginResponse->assertJsonStructure([
        'token',
        'user' => ['id', 'name', 'email', 'role', 'tenant'],
    ]);

    $token = $loginResponse->json('token');

    // 2. Test /me endpoint
    $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me');

    $meResponse->assertOk();
    $meResponse->assertJson([
        'data' => [
            'id' => $user->id,
            'email' => $user->email,
            'role' => 'tenant',
        ],
    ]);

    // 3. Test authenticated feature route
    $dashboardResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/tenant/dashboard');

    $dashboardResponse->assertOk();
    $dashboardResponse->assertJsonPath('data.tenant.id', $tenant->id);

    // 4. Test Logout
    $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/auth/logout');

    $logoutResponse->assertOk();

    // Verify token is revoked in database
    $this->assertDatabaseCount('personal_access_tokens', 0);

    // Verify subsequent request with same token fails (401)
    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me')
        ->assertStatus(401);

    // Verify request with a fake token fails
    $this->withHeader('Authorization', 'Bearer invalid-token')
        ->getJson('/api/v1/auth/me')
        ->assertStatus(401);
});
