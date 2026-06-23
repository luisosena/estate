<?php

use App\Models\Payment;
use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create([
        'owner_id' => $this->landlord->id,
        'name' => 'Lakeside Apartments',
        'address' => '12 Acacia Avenue',
    ]);
    $this->unit = Unit::factory()->create([
        'property_id' => $this->property->id,
        'status' => 'occupied',
    ]);
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'unit_id' => $this->unit->id,
        'tenant_id' => $this->tenant->id,
        'status' => 'active',
        'monthly_rent' => 250000,
    ]);
});

test('guest is redirected from landlord dashboard', function () {
    get(route('landlord.dashboard'))->assertRedirect(route('login'));
});

test('landlord can view the dashboard with all KPI sections', function () {
    RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'status' => 'overdue',
        'amount_due' => 250000,
    ]);
    Payment::factory()->create([
        'tenant_id' => $this->tenant->id,
        'tenancy_id' => $this->tenancy->id,
        'amount' => 250000,
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    actingAs($this->landlord)
        ->get(route('landlord.dashboard'))
        ->assertSuccessful()
        ->assertInertia(
            fn ($page) => $page
                ->component('landlord/dashboard')
                ->has('stats.total_tenants')
                ->has('stats.total_properties')
                ->has('stats.total_units')
                ->has('stats.occupancy_rate')
                ->has('stats.monthly_revenue')
                ->has('stats.pending_rent_bills')
                ->has('stats.overdue_rent_bills')
                ->has('stats.total_rent_outstanding')
                ->has('trends.total_tenants.direction')
                ->has('trends.total_properties.delta_pct')
                ->has('trends.total_units.delta_pct')
                ->has('trends.occupancy_rate.delta_pct')
                ->has('trends.monthly_revenue.delta_pct')
                ->has('properties.data', 1)
                ->has('revenueTrend', 6)
                ->has('collectionTrend', 6)
        );
});

test('dashboard trend direction reports up when tenants increase month over month', function () {
    Tenancy::factory()->create([
        'unit_id' => $this->unit->id,
        'tenant_id' => Tenant::factory()->create()->id,
        'status' => 'active',
        'created_at' => now()->subMonths(2),
    ]);

    $this->tenancy->update(['created_at' => now()]);

    actingAs($this->landlord)
        ->get(route('landlord.dashboard'))
        ->assertSuccessful()
        ->assertInertia(
            fn ($page) => $page
                ->where('trends.total_tenants.direction', 'up')
                ->where('trends.total_tenants.previous', 1)
        );
});

test('dashboard occupancy rate matches computed percentage', function () {
    Unit::factory()->create([
        'property_id' => $this->property->id,
        'status' => 'vacant',
    ]);

    actingAs($this->landlord)
        ->get(route('landlord.dashboard'))
        ->assertSuccessful()
        ->assertInertia(
            fn ($page) => $page
                ->where('stats.total_units', 2)
                ->where('stats.occupied_units', 1)
                ->where('stats.occupancy_rate', 50)
        );
});
