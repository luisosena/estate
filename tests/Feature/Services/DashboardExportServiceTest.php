<?php

use App\Enums\Role;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => Role::Landlord]);
    $this->tenant = Tenant::factory()->create();
    $this->tenantUser = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $this->tenant->id]);
    $this->admin = User::factory()->create(['role' => Role::Admin]);
});

test('landlord can export dashboard as csv', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenancy = Tenancy::factory()->create(['unit_id' => $unit->id, 'tenant_id' => $this->tenant->id]);
    Payment::factory()->create(['tenancy_id' => $tenancy->id, 'tenant_id' => $this->tenant->id, 'status' => 'paid', 'amount' => 50000, 'paid_at' => now()]);

    $response = $this->actingAs($this->landlord)
        ->get(route('landlord.dashboard.export.csv'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('landlord can export dashboard as pdf', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenancy = Tenancy::factory()->create(['unit_id' => $unit->id, 'tenant_id' => $this->tenant->id]);
    Payment::factory()->create(['tenancy_id' => $tenancy->id, 'tenant_id' => $this->tenant->id, 'status' => 'paid', 'amount' => 50000, 'paid_at' => now()]);

    $response = $this->actingAs($this->landlord)
        ->get(route('landlord.dashboard.export.pdf'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

test('tenant is forbidden from landlord export', function () {
    $response = $this->actingAs($this->tenantUser)
        ->get(route('landlord.dashboard.export.csv'));

    $response->assertForbidden();
});

test('landlord is forbidden from tenant export', function () {
    $response = $this->actingAs($this->landlord)
        ->get(route('tenant.dashboard.export.csv'));

    $response->assertForbidden();
});

test('tenant can export dashboard as csv', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenancy = Tenancy::factory()->create(['unit_id' => $unit->id, 'tenant_id' => $this->tenant->id, 'status' => 'active']);

    $response = $this->actingAs($this->tenantUser)
        ->get(route('tenant.dashboard.export.csv'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('tenant can export dashboard as pdf', function () {
    $property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);
    $tenancy = Tenancy::factory()->create(['unit_id' => $unit->id, 'tenant_id' => $this->tenant->id, 'status' => 'active']);

    $response = $this->actingAs($this->tenantUser)
        ->get(route('tenant.dashboard.export.pdf'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

test('guest is forbidden from export endpoints', function () {
    $this->get(route('landlord.dashboard.export.csv'))->assertRedirect();
    $this->get(route('landlord.dashboard.export.pdf'))->assertRedirect();
    $this->get(route('tenant.dashboard.export.csv'))->assertRedirect();
    $this->get(route('tenant.dashboard.export.pdf'))->assertRedirect();
});
