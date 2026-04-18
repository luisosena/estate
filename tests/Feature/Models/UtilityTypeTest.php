<?php

use App\Models\TenancyUtility;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('utility type factory creates a valid record', function () {
    $type = UtilityType::factory()->create([
        'name' => 'Water',
        'is_active' => true,
    ]);

    expect($type)->toBeInstanceOf(UtilityType::class)
        ->and($type->name)->toBe('Water')
        ->and($type->is_active)->toBeTrue();

    $this->assertDatabaseHas('utility_types', ['id' => $type->id, 'name' => 'Water']);
});

test('utility type scope active filters only active types', function () {
    UtilityType::factory()->create(['name' => 'Water',       'is_active' => true]);
    UtilityType::factory()->create(['name' => 'Electricity', 'is_active' => false]);

    $activeTypes = UtilityType::active()->get();

    expect($activeTypes)->not->toBeEmpty()
        ->and($activeTypes->pluck('is_active')->contains(false))->toBeFalse();
});

test('utility type can be assigned to many tenancy utilities', function () {
    $type = UtilityType::factory()->create(['is_active' => true]);

    TenancyUtility::factory()->count(3)->create(['utility_type_id' => $type->id]);

    expect($type->tenancyUtilities()->count())->toBe(3);
});

test('utility type has the required fillable fields', function () {
    $type = new UtilityType;

    expect($type->getFillable())->toContain('name')
        ->and($type->getFillable())->toContain('is_active');
});
