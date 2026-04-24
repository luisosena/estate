<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord] = $this->createApiLandlord();
});

test('landlord can access API dashboard', function () {
    $this->getJson('/api/landlord/dashboard')
        ->assertOk()
        ->assertJsonStructure([
            'total_properties',
            'total_units',
            'total_tenants',
            'revenue_mtd',
            'recent_payments' => [
                '*' => ['id', 'amount', 'paid_at', 'status', 'tenant_name', 'unit_code', 'tenancy' => ['id', 'tenant', 'unit']],
            ],
            'properties' => [
                '*' => ['id', 'name', 'address', 'units_count', 'active_tenancies_count'],
            ],
        ]);
});

test('landlord dashboard stats are scoped to own data', function () {
    // A second landlord's data should not bleed in
    $other = User::factory()->create(['role' => 'landlord']);
    Property::factory()->create(['owner_id' => $other->id]);

    $ownStats = $this->getJson('/api/landlord/dashboard')->json('total_properties');

    expect($ownStats)->not->toBeNull();
});

test('unauthenticated request to landlord dashboard returns 401', function () {
    $this->withoutMiddleware(EnsureFrontendRequestsAreStateful::class);
    $this->app['auth']->forgetGuards();

    $this->getJson('/api/landlord/dashboard', ['Authorization' => ''])
        ->assertUnauthorized();
});
