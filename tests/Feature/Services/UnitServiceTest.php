<?php

use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use App\Services\Landlord\UnitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

it('calculates global unit metrics correctly', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);
    $property = Property::factory()->create(['owner_id' => $landlord->id]);

    Unit::factory()->count(2)->create([
        'property_id' => $property->id,
        'status' => 'occupied'
    ]);
    Unit::factory()->count(3)->create([
        'property_id' => $property->id,
        'status' => 'available'
    ]);

    $service = new UnitService();
    $request = new Request();
    $result = $service->getUnitList($landlord, $request);

    expect($result['metrics']['total_units'])->toBe(5)
        ->and($result['metrics']['occupied_units'])->toBe(2)
        ->and($result['metrics']['available_units'])->toBe(3)
        ->and($result['metrics']['occupancy_rate'])->toBe(40.0);
});

it('filters units and calculates property-specific metrics', function () {
    $landlord = User::factory()->create(['role' => 'landlord']);
    $propertyA = Property::factory()->create(['owner_id' => $landlord->id]);
    $propertyB = Property::factory()->create(['owner_id' => $landlord->id]);

    Unit::factory()->count(2)->create(['property_id' => $propertyA->id, 'status' => 'occupied']);
    Unit::factory()->count(3)->create(['property_id' => $propertyB->id, 'status' => 'available']);

    $service = new UnitService();
    $request = new Request(['property' => $propertyA->id]);
    $result = $service->getUnitList($landlord, $request);

    expect($result['units']->total())->toBe(2)
        ->and($result['propertyMetrics']['total_units'])->toBe(2)
        ->and($result['propertyMetrics']['occupied_units'])->toBe(2);
});
