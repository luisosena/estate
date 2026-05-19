<?php

use App\Models\Payment;
use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Services\Landlord\RevenueAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id, 'status' => 'occupied']);
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
        'monthly_rent' => 50000,
    ]);
});

test('getMonthlyRevenueTrend returns 12 months of data', function () {
    Payment::factory()->create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 50000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $service = app(RevenueAnalyticsService::class);
    $trend = $service->getMonthlyRevenueTrend($this->landlord, 12);

    expect($trend)->toHaveCount(12)
        ->and($trend->first())->toHaveKeys(['month', 'label', 'total_revenue', 'payment_count']);
});

test('getMonthlyRevenueTrend returns zeros when no payments exist', function () {
    $service = app(RevenueAnalyticsService::class);
    $trend = $service->getMonthlyRevenueTrend($this->landlord, 6);

    expect($trend)->toHaveCount(6)
        ->and($trend->first()['total_revenue'])->toBeFloat()
        ->and($trend->first()['total_revenue'])->toBe(0.0)
        ->and($trend->first()['payment_count'])->toBe(0);
});

test('getMonthlyRevenueTrend aggregates payments correctly', function () {
    Payment::factory()->create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 30000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    Payment::factory()->create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 20000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $service = app(RevenueAnalyticsService::class);
    $trend = $service->getMonthlyRevenueTrend($this->landlord, 1);

    $currentMonth = $trend->firstWhere('month', now()->format('Y-m'));
    expect($currentMonth['total_revenue'])->toBeFloat()
        ->and($currentMonth['total_revenue'])->toBe(50000.0)
        ->and($currentMonth['payment_count'])->toBe(2);
});

test('getPaymentCollectionTrend returns 12 months of data', function () {
    RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'status' => 'paid',
        'billing_month' => now()->startOfMonth(),
    ]);

    $service = app(RevenueAnalyticsService::class);
    $trend = $service->getPaymentCollectionTrend($this->landlord, 12);

    expect($trend)->toHaveCount(12)
        ->and($trend->first())->toHaveKeys(['month', 'label', 'paid', 'pending', 'overdue', 'partial', 'waived', 'total']);
});

test('getPaymentCollectionTrend returns zeros when no bills exist', function () {
    $service = app(RevenueAnalyticsService::class);
    $trend = $service->getPaymentCollectionTrend($this->landlord, 6);

    expect($trend)->toHaveCount(6)
        ->and($trend->first()['total'])->toBe(0);
});

test('getSystemRevenueTrend returns data across all landlords', function () {
    $landlord2 = User::factory()->create(['role' => 'landlord']);
    $property2 = Property::factory()->create(['owner_id' => $landlord2->id]);
    $unit2 = Unit::factory()->create(['property_id' => $property2->id, 'status' => 'occupied']);
    $tenant2 = Tenant::factory()->create();
    $tenancy2 = Tenancy::factory()->create([
        'tenant_id' => $tenant2->id,
        'unit_id' => $unit2->id,
        'status' => 'active',
    ]);

    Payment::factory()->create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 50000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    Payment::factory()->create([
        'tenant_id' => $tenant2->id,
        'tenancy_id' => $tenancy2->id,
        'amount' => 75000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    $service = app(RevenueAnalyticsService::class);
    $trend = $service->getSystemRevenueTrend(1);

    $currentMonth = $trend->firstWhere('month', now()->format('Y-m'));
    expect($currentMonth['total_revenue'])->toBeFloat()
        ->and($currentMonth['total_revenue'])->toBe(125000.0)
        ->and($currentMonth['payment_count'])->toBe(2);
});
