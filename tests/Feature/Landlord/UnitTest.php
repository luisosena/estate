<?php

use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
});

test('guest is redirected from unit create form', function () {
    get(route('landlord.units.create'))->assertRedirect(route('login'));
});

test('landlord can view the create unit form', function () {
    actingAs($this->landlord)
        ->get(route('landlord.units.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/units/create')->has('properties'));
});

test('landlord can create a unit with valid data', function () {
    actingAs($this->landlord)
        ->post(route('landlord.units.store'), [
            'property_id' => $this->property->id,
            'unit_code' => 'U-A01',
            'unit_name' => 'Unit A01',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('units', [
        'property_id' => $this->property->id,
        'unit_code' => 'U-A01',
        'unit_name' => 'Unit A01',
    ]);
});

test('landlord cannot create a unit for a property they do not own', function () {
    $other = Property::factory()->create(); // owned by a different landlord

    actingAs($this->landlord)
        ->post(route('landlord.units.store'), [
            'property_id' => $other->id,
            'unit_code' => 'U-B01',
            'unit_name' => 'Unit B01',
        ])
        ->assertForbidden();
});

test('unit_code must be unique', function () {
    Unit::factory()->create([
        'property_id' => $this->property->id,
        'unit_code' => 'EXISTING-CODE',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.units.store'), [
            'property_id' => $this->property->id,
            'unit_code' => 'EXISTING-CODE',
            'unit_name' => 'Duplicate Unit',
        ])
        ->assertSessionHasErrors('unit_code');
});

test('unit store fails without required fields', function (string $field) {
    $payload = [
        'property_id' => $this->property->id,
        'unit_code' => 'U-TEST',
        'unit_name' => 'Test Unit',
    ];

    unset($payload[$field]);

    actingAs($this->landlord)
        ->post(route('landlord.units.store'), $payload)
        ->assertSessionHasErrors($field);
})->with(['unit_code', 'unit_name']);

test('unit store without property_id returns unauthorized', function () {
    // StoreUnitRequest::authorize() returns false when property_id is absent
    actingAs($this->landlord)
        ->post(route('landlord.units.store'), [
            'unit_code' => 'U-NOOWNER',
            'unit_name' => 'No Owner Unit',
        ])
        ->assertForbidden();
});

test('landlord can view the unit index', function () {
    Unit::factory()->create(['property_id' => $this->property->id]);

    actingAs($this->landlord)
        ->get(route('landlord.units.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/units/index')->has('units'));
});

test('landlord can view a unit detail page', function () {
    $unit = Unit::factory()->create(['property_id' => $this->property->id]);

    actingAs($this->landlord)
        ->get(route('landlord.units.show', $unit))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/units/show'));
});

test('tenant cannot access unit management', function () {
    $tenant = User::factory()->create(['role' => 'tenant']);
    actingAs($tenant)->get(route('landlord.units.index'))->assertForbidden();
});
