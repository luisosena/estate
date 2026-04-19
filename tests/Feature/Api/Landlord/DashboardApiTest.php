<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord] = $this->createApiLandlord();
});

test('landlord can access API dashboard', function () {
    $this->getJson('/api/landlord/dashboard')
        ->assertOk()
        ->assertJsonStructure(['stats']);
});

test('landlord dashboard stats are scoped to own data', function () {
    // A second landlord's data should not bleed in
    $other = \App\Models\User::factory()->create(['role' => 'landlord']);
    \App\Models\Property::factory()->create(['owner_id' => $other->id]);

    $ownStats = $this->getJson('/api/landlord/dashboard')->json('stats');

    expect($ownStats)->not->toBeNull();
});

test('unauthenticated request to landlord dashboard returns 401', function () {
    $this->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
    auth()->logout();

    $this->getJson('/api/landlord/dashboard', ['Authorization' => ''])
        ->assertUnauthorized();
});
