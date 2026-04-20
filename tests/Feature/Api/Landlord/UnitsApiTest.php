<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord, 'property' => $this->property, 'unit' => $this->unit]
        = $this->createApiLandlord();
});

test('landlord can list units', function () {
    $this->getJson('/api/landlord/units')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

test('landlord can create a unit for own property', function () {
    $this->postJson('/api/landlord/units', [
        'property_id' => $this->property->id,
        'unit_code'   => 'A101',
        'unit_name'   => 'A101',
        'floor'       => 1,
    ])->assertCreated();

    $this->assertDatabaseHas('units', ['unit_code' => 'A101', 'property_id' => $this->property->id]);
});

test('unit creation fails without required fields', function () {
    $this->postJson('/api/landlord/units', [])->assertUnprocessable();
});

test('landlord can update own unit', function () {
    $this->unit->update(['status' => 'available']);

    $this->putJson("/api/landlord/units/{$this->unit->id}", [
        'unit_code' => 'B202',
    ])->assertOk();
});

test('landlord can delete a vacant unit', function () {
    $vacant = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'available']);

    $this->deleteJson("/api/landlord/units/{$vacant->id}")->assertOk();

    $this->assertDatabaseMissing('units', ['id' => $vacant->id]);
});

test('landlord cannot see units from another landlords property', function () {
    $other     = User::factory()->create(['role' => 'landlord']);
    $otherProp = Property::factory()->create(['owner_id' => $other->id]);
    $otherUnit = Unit::factory()->create(['property_id' => $otherProp->id]);

    $response = $this->getJson('/api/landlord/units')->assertOk();
    $ids      = collect($response->json('data'))->pluck('id');

    expect($ids->contains($otherUnit->id))->toBeFalse();
});
