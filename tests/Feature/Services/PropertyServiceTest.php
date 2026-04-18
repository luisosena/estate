<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Services\Landlord\PropertyService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('calculates global property statistics correctly', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);

    // Create 2 properties with a total of 10 configured units
    $propertyA = Property::factory()->create(['owner_id' => $landlord->id, 'total_units' => 4]);
    $propertyB = Property::factory()->create(['owner_id' => $landlord->id, 'total_units' => 6]);

    // Property A: 2 occupied units
    $unitA1 = Unit::factory()->create(['property_id' => $propertyA->id, 'status' => 'occupied']);
    $unitA2 = Unit::factory()->create(['property_id' => $propertyA->id, 'status' => 'occupied']);
    Unit::factory()->count(2)->create(['property_id' => $propertyA->id, 'status' => 'available']);

    Tenancy::factory()->create(['unit_id' => $unitA1->id, 'status' => 'active']);
    Tenancy::factory()->create(['unit_id' => $unitA2->id, 'status' => 'active']);

    // Property B: 3 occupied units
    $unitB1 = Unit::factory()->create(['property_id' => $propertyB->id, 'status' => 'occupied']);
    $unitB2 = Unit::factory()->create(['property_id' => $propertyB->id, 'status' => 'occupied']);
    $unitB3 = Unit::factory()->create(['property_id' => $propertyB->id, 'status' => 'occupied']);
    Unit::factory()->count(3)->create(['property_id' => $propertyB->id, 'status' => 'available']);

    Tenancy::factory()->create(['unit_id' => $unitB1->id, 'status' => 'active']);
    Tenancy::factory()->create(['unit_id' => $unitB2->id, 'status' => 'active']);
    Tenancy::factory()->create(['unit_id' => $unitB3->id, 'status' => 'active']);

    // Total occupied = 5. Total config units = 10. Available = 5, Rate = 50%
    $service = new PropertyService();
    $result = $service->getPropertyList($landlord);

    expect($result['stats'])->toBeArray()
        ->and($result['stats']['total_properties'])->toBe(2)
        ->and($result['stats']['total_units'])->toBe(10)
        ->and($result['stats']['total_occupied_units'])->toBe(5)
        ->and($result['stats']['total_available_units'])->toBe(5)
        ->and($result['stats']['overall_occupancy_rate'])->toBe(50.0);
});

it('lists only properties belonging to the landlord', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);
    $otherLandlord = User::factory()->create(['role' => 'landlord']);

    Property::factory()->count(3)->create(['owner_id' => $landlord->id]);
    Property::factory()->count(2)->create(['owner_id' => $otherLandlord->id]);

    $service = new PropertyService();
    $result = $service->getPropertyList($landlord);

    expect($result['properties']->total())->toBe(3);
});
