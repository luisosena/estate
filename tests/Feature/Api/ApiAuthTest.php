<?php

use App\Models\Tenant;
use App\Models\User;

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

    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => $password,
    ]);

    $loginResponse->assertOk();
    $loginResponse->assertJsonStructure([
        'token',
        'refresh_token',
        'user' => ['id', 'name', 'email', 'role', 'tenant'],
    ]);

    $token = $loginResponse->json('token');
    $refreshToken = $loginResponse->json('refresh_token');

    $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me');

    $meResponse->assertOk();
    $meResponse->assertJson([
        'id' => $user->id,
        'email' => $user->email,
        'role' => 'tenant',
    ]);

    $dashboardResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/tenant/dashboard');

    $dashboardResponse->assertOk();
    $dashboardResponse->assertJsonPath('tenant.id', $tenant->id);

    $refreshResponse = $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => $refreshToken,
    ]);

    $refreshResponse->assertOk();
    $refreshResponse->assertJsonStructure(['token']);

    $newToken = $refreshResponse->json('token');

    $meAfterRefreshResponse = $this->withHeader('Authorization', "Bearer {$newToken}")
        ->getJson('/api/v1/auth/me');

    $meAfterRefreshResponse->assertOk();
    $meAfterRefreshResponse->assertJson([
        'id' => $user->id,
        'email' => $user->email,
        'role' => 'tenant',
    ]);
});
