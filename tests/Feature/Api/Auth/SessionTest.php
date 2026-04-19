<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
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
    $token = $this->user->createToken('secondary-device')->plainTextToken;
    $tokenId = PersonalAccessToken::findToken($token)?->id;

    $this->deleteJson("/api/v1/auth/sessions/{$tokenId}")
        ->assertOk();

    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
});

test('authenticated user can terminate all sessions', function () {
    $this->user->createToken('device-1');
    $this->user->createToken('device-2');

    $this->deleteJson('/api/v1/auth/sessions/terminate-all')
        ->assertOk();

    expect($this->user->tokens()->count())->toBe(0);
});

test('user cannot terminate another users session', function () {
    $otherTenant = Tenant::factory()->create();
    $other       = User::factory()->create(['role' => 'tenant', 'tenant_id' => $otherTenant->id]);
    $token       = $other->createToken('their-device')->plainTextToken;
    $tokenId     = PersonalAccessToken::findToken($token)?->id;

    $this->deleteJson("/api/v1/auth/sessions/{$tokenId}")
        ->assertForbidden();
});
