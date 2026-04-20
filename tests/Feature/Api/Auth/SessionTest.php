<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant  = Tenant::factory()->create();
    $this->user    = User::factory()->create(['role' => 'tenant', 'tenant_id' => $this->tenant->id]);
    Sanctum::actingAs($this->user, ['*']);
});

test('authenticated user can list own sessions', function () {
    $this->getJson('/api/v1/auth/sessions')
        ->assertOk()
        ->assertJsonStructure(['sessions']);
});

test('authenticated user can terminate a specific session', function () {
    // Create a secondary token to terminate
    $token = \App\Models\ApiToken::create([
        'user_id' => $this->user->id,
        'token_hash' => hash('sha256', 'dummy-token'),
        'device_name' => 'secondary-device',
        'expires_at' => now()->addDays(1),
    ]);
    
    $this->deleteJson("/api/v1/auth/sessions/{$token->id}")
        ->assertOk();

    $this->assertNotNull($token->fresh()->revoked_at);
});

test('authenticated user can terminate all sessions', function () {
    \App\Models\ApiToken::create(['user_id' => $this->user->id, 'token_hash' => hash('sha256', 't1'), 'expires_at' => now()->addDays(1)]);
    \App\Models\ApiToken::create(['user_id' => $this->user->id, 'token_hash' => hash('sha256', 't2'), 'expires_at' => now()->addDays(1)]);

    $this->deleteJson('/api/v1/auth/sessions/terminate-all')
        ->assertOk();

    expect(\App\Models\ApiToken::where('user_id', $this->user->id)->whereNull('revoked_at')->count())->toBe(0);
});

test('user cannot terminate another users session', function () {
    $otherTenant = Tenant::factory()->create();
    $other       = User::factory()->create(['role' => 'tenant', 'tenant_id' => $otherTenant->id]);
    $token       = \App\Models\ApiToken::create([
        'user_id' => $other->id,
        'token_hash' => hash('sha256', 'their-token'),
        'expires_at' => now()->addDays(1),
    ]);

    $this->deleteJson("/api/v1/auth/sessions/{$token->id}")
        ->assertNotFound();
});
