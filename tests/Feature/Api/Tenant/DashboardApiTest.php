<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    [
        'user'    => $this->user,
        'tenant'  => $this->tenant,
        'tenancy' => $this->tenancy,
    ] = $this->createApiTenant();
});

test('tenant can access dashboard', function () {
    $this->getJson('/api/tenant/dashboard')
        ->assertOk()
        ->assertJsonFragment(['id' => $this->tenant->id]);
});

test('tenant dashboard is scoped to own tenant data', function () {
    // Another tenant should not appear in this response
    $otherTenant = \App\Models\Tenant::factory()->create();
    $other       = User::factory()->create(['role' => 'tenant', 'tenant_id' => $otherTenant->id]);

    $data = $this->getJson('/api/tenant/dashboard')->json();

    // Confirm the response tenant ID is ours
    expect($data['tenant']['id'])->toBe($this->tenant->id);
});

test('unauthenticated request to tenant dashboard returns 401', function () {
    $this->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
    $this->app['auth']->forgetGuards();

    $this->getJson('/api/tenant/dashboard', ['Authorization' => ''])
        ->assertUnauthorized();
});

test('landlord user cannot access tenant dashboard endpoint', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);
    \Laravel\Sanctum\Sanctum::actingAs($landlord, ['*']);

    $this->getJson('/api/tenant/dashboard')->assertForbidden();
});
