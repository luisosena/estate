<?php

use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('returns 403 when a landlord views another landlords unit', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->getJson("/api/v1/landlord/units/{$unit->id}")
        ->assertForbidden();
});

it('returns 403 when a landlord updates another landlords unit', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->putJson("/api/v1/landlord/units/{$unit->id}", ['unit_name' => 'Hacked'])
        ->assertForbidden();
});

it('returns 403 when a landlord deletes another landlords unit', function (): void {
    $owner = User::factory()->create(['role' => 'landlord']);
    $other = User::factory()->create(['role' => 'landlord']);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    Sanctum::actingAs($owner, ['*']);

    $this->deleteJson("/api/v1/landlord/units/{$unit->id}")
        ->assertForbidden();
});
