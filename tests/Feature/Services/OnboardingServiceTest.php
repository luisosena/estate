<?php

use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\Property;
use App\Services\DocumentService;
use App\Services\Landlord\OnboardingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('onboards a new tenant and relates them to an occupied unit', function () {
    $property = Property::factory()->create(['total_units' => 1]);
    $unit = Unit::factory()->create([
        'property_id' => $property->id,
        'status' => 'available'
    ]);

    $data = [
        'full_name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '1234567890',
        'unit_id' => $unit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 1500,
        'security_deposit' => 3000,
    ];

    $service = app(OnboardingService::class);
    $result = $service->onboard($data);

    // Assertions
    expect(Tenant::count())->toBe(1)
        ->and($result['tenant']->email)->toBe($data['email'])
        ->and(Tenancy::count())->toBe(1)
        ->and($result['tenancy']->monthly_rent)->toEqual(1500)
        ->and($unit->fresh()->status)->toBe('occupied');
});

it('finds existing tenant by email/phone during onboarding', function () {
    $existingTenant = Tenant::factory()->create([
        'email' => 'existing@example.com',
        'phone' => '0987654321'
    ]);

    $property = Property::factory()->create();
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    $data = [
        'full_name' => 'Existing Name Updated', // updateOrCreate might change name if logic allows, though current service uses email/phone as key
        'email' => 'existing@example.com',
        'phone' => '0987654321',
        'unit_id' => $unit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 1000,
    ];

    $service = app(OnboardingService::class);
    $service->onboard($data);

    expect(Tenant::count())->toBe(1); // Should not create a second tenant record
});
