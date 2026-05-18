<?php

use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Services\Tenant\TenantDashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('aggregates tenant dashboard data correctly', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => 'tenant', 'tenant_id' => $tenant->id]);
    $property = Property::factory()->create();
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    $activeTenancy = Tenancy::factory()->create([
        'tenant_id' => $tenant->id,
        'unit_id' => $unit->id,
        'status' => 'active',
        'monthly_rent' => 1200,
    ]);

    // Create a past bill
    RentBill::factory()->create([
        'tenancy_id' => $activeTenancy->id,
        'billing_month' => now()->subMonth()->startOfMonth(),
        'amount_due' => 1200,
    ]);

    // Create current month bill
    RentBill::factory()->create([
        'tenancy_id' => $activeTenancy->id,
        'billing_month' => now()->startOfMonth(),
        'amount_due' => 1200,
    ]);

    $service = new TenantDashboardService;
    $result = $service->getDashboardData($tenant);

    expect($result['tenant']->id)->toBe($tenant->id)
        ->and($result['unit']->id)->toBe($unit->id)
        ->and($result['tenancy']->id)->toBe($activeTenancy->id)
        ->and($result['rent_bills']->count())->toBe(1)
        ->and($result['current_month_bill']->id)->not->toBeNull();
});

it('handles tenants with no active tenancy gracefully', function () {
    $tenant = Tenant::factory()->create();

    $service = new TenantDashboardService;
    $result = $service->getDashboardData($tenant);

    expect($result['tenancy'])->toBeNull()
        ->and($result['unit'])->toBeNull();
});
