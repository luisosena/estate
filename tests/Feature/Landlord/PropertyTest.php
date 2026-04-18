<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
});

test('guest is redirected from property index', function () {
    get(route('landlord.properties.index'))->assertRedirect(route('login'));
});

test('tenant cannot access property index', function () {
    $tenant = User::factory()->create(['role' => 'tenant']);
    actingAs($tenant)->get(route('landlord.properties.index'))->assertForbidden();
});

test('landlord can view their property index', function () {
    actingAs($this->landlord)
        ->get(route('landlord.properties.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/properties/index')->has('properties'));
});

test('landlord only sees their own properties', function () {
    $otherLandlord = User::factory()->create(['role' => 'landlord']);
    Property::factory()->create(['owner_id' => $otherLandlord->id, 'name' => 'Other Estate']);

    $response = actingAs($this->landlord)
        ->get(route('landlord.properties.index'))
        ->assertSuccessful();

    // The other landlord's property should not appear in the result
    $properties = $response->original->getData()['page']['props']['properties']['data'] ?? [];
    $names = collect($properties)->pluck('name');
    expect($names)->not->toContain('Other Estate');
});
