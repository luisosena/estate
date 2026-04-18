<?php

use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
});

/** @return array<string, mixed> */
function validPropertyPayload(User $owner): array
{
    return [
        'owner_id' => $owner->id,
        'name' => 'Sunrise Apartments',
        'address' => '123 Main St',
        'city' => 'Nairobi',
        'state' => 'Nairobi',
        'postal_code' => '00100',
        'country' => 'Kenya',
        'property_type' => 'apartment',
        'total_units' => 10,
        'status' => 'active',
    ];
}

test('guest is redirected from admin property index', function () {
    get(route('admin.properties.index'))->assertRedirect(route('login'));
});

test('admin can view property index', function () {
    actingAs($this->admin)
        ->get(route('admin.properties.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/properties/index')->has('properties'));
});

test('landlord can access admin property index (policy allows admin+landlord)', function () {
    actingAs($this->landlord)
        ->get(route('admin.properties.index'))
        ->assertSuccessful();
});

test('admin can create a property', function () {
    actingAs($this->admin)
        ->post(route('admin.properties.store'), validPropertyPayload($this->landlord))
        ->assertRedirect(route('admin.properties.index'));

    $this->assertDatabaseHas('properties', ['name' => 'Sunrise Apartments']);
});

test('property creation fails without required fields', function (string $field) {
    $payload = validPropertyPayload($this->landlord);
    unset($payload[$field]);

    actingAs($this->admin)
        ->post(route('admin.properties.store'), $payload)
        ->assertSessionHasErrors($field);
})->with(['owner_id', 'name', 'address', 'city', 'state', 'postal_code', 'country', 'property_type', 'total_units', 'status']);

test('landlord cannot create a property via admin route', function () {
    actingAs($this->landlord)
        ->post(route('admin.properties.store'), validPropertyPayload($this->landlord))
        ->assertForbidden();
});

test('admin can update a property', function () {
    actingAs($this->admin)
        ->put(route('admin.properties.update', $this->property), [
            ...validPropertyPayload($this->landlord),
            'name' => 'Updated Estate',
        ])
        ->assertRedirect(route('admin.properties.index'));

    $this->assertDatabaseHas('properties', ['id' => $this->property->id, 'name' => 'Updated Estate']);
});

test('admin can delete a property with no units', function () {
    $empty = Property::factory()->create(['owner_id' => $this->landlord->id]);

    actingAs($this->admin)
        ->delete(route('admin.properties.destroy', $empty))
        ->assertRedirect(route('admin.properties.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('properties', ['id' => $empty->id]);
});

test('admin cannot delete a property that has units', function () {
    Unit::factory()->create(['property_id' => $this->property->id]);

    actingAs($this->admin)
        ->delete(route('admin.properties.destroy', $this->property))
        ->assertRedirect(route('admin.properties.index'))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('properties', ['id' => $this->property->id]);
});

test('landlord cannot delete a property', function () {
    actingAs($this->landlord)
        ->delete(route('admin.properties.destroy', $this->property))
        ->assertForbidden();
});
