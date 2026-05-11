<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('returns 403 when a landlord tries to view another landlords property', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);
    $property = Property::factory()->create(['owner_id' => $other->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->getJson("/api/v1/landlord/properties/{$property->id}")
        ->assertForbidden();
});

it('returns 403 when a landlord tries to update another landlords property', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);
    $property = Property::factory()->create(['owner_id' => $other->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->putJson("/api/v1/landlord/properties/{$property->id}", [
        'name' => 'Updated Name',
    ])->assertForbidden();
});

it('returns 403 when a landlord tries to delete another landlords property', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);
    $property = Property::factory()->create(['owner_id' => $other->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->deleteJson("/api/v1/landlord/properties/{$property->id}")
        ->assertForbidden();
});

it('allows landlord to view their own property', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $property = Property::factory()->create(['owner_id' => $owner->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->getJson("/api/v1/landlord/properties/{$property->id}")
        ->assertOk();
});
