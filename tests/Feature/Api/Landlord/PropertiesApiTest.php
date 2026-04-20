<?php

use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();
});

// --- Index ---

test('landlord can list own properties', function () {
    $this->getJson('/api/landlord/properties')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta', 'stats']);
});

test('landlord cannot see another landlords properties', function () {
    $other    = User::factory()->create(['role' => 'landlord']);
    $otherProp = Property::factory()->create(['owner_id' => $other->id]);

    $response = $this->getJson('/api/landlord/properties')->assertOk();

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids->contains($otherProp->id))->toBeFalse();
});

// --- Show ---

test('landlord can get single own property', function () {
    $this->getJson("/api/landlord/properties/{$this->property->id}")
        ->assertOk()
        ->assertJsonFragment(['id' => $this->property->id]);
});

test('landlord cannot get another landlords property', function () {
    $other     = User::factory()->create(['role' => 'landlord']);
    $otherProp = Property::factory()->create(['owner_id' => $other->id]);

    $this->getJson("/api/landlord/properties/{$otherProp->id}")->assertNotFound();
});

// --- Store ---

test('landlord can create a property', function () {
    $this->postJson('/api/landlord/properties', [
        'name'    => 'Sunset Towers',
        'address' => '123 Main Street',
    ])->assertCreated()
      ->assertJsonFragment(['name' => 'Sunset Towers']);

    $this->assertDatabaseHas('properties', ['name' => 'Sunset Towers', 'owner_id' => $this->landlord->id]);
});

test('property creation fails without required fields', function () {
    $this->postJson('/api/landlord/properties', [])->assertUnprocessable();
});

// --- Update ---

test('landlord can update own property', function () {
    $this->putJson("/api/landlord/properties/{$this->property->id}", [
        'name' => 'Updated Name',
    ])->assertOk()
      ->assertJsonFragment(['name' => 'Updated Name']);
});

// --- Destroy ---

test('landlord can delete a property without units', function () {
    $empty = Property::factory()->create(['owner_id' => $this->landlord->id]);

    $this->deleteJson("/api/landlord/properties/{$empty->id}")->assertOk();

    $this->assertDatabaseMissing('properties', ['id' => $empty->id]);
});

test('landlord cannot delete a property that has units', function () {
    $this->deleteJson("/api/landlord/properties/{$this->property->id}")
        ->assertUnprocessable();
});

// --- Auth guard ---

test('unauthenticated request to properties returns 401', function () {
    $this->withoutMiddleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
    $this->app['auth']->forgetGuards();

    $this->getJson('/api/landlord/properties', ['Authorization' => ''])
        ->assertUnauthorized();
});
