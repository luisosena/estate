<?php

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id]);
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'unit_id' => $this->unit->id,
        'tenant_id' => $this->tenant->id,
        'status' => 'active',
    ]);
    $this->utilityType = UtilityType::factory()->create(['is_active' => true]);
});

test('guest is redirected from utility index', function () {
    get(route('landlord.utilities.index'))->assertRedirect(route('login'));
});

test('landlord can view utility index', function () {
    actingAs($this->landlord)
        ->get(route('landlord.utilities.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/utilities/index'));
});

test('landlord can view utility create form for a tenancy', function () {
    actingAs($this->landlord)
        ->get(route('landlord.utilities.create', $this->tenancy))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/utilities/create'));
});

test('landlord can assign a utility to a tenancy', function () {
    actingAs($this->landlord)
        ->post(route('landlord.utilities.store', $this->tenancy), [
            'utility_type_id' => $this->utilityType->id,
            'amount' => 500,
            'billing_cycle' => 'monthly',
            'status' => 'active',
        ])
        ->assertRedirect(route('landlord.utilities.index'));

    $this->assertDatabaseHas('tenancy_utilities', [
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
});

test('utility assignment requires utility_type_id, amount, billing_cycle, status', function (string $field) {
    $payload = [
        'utility_type_id' => $this->utilityType->id,
        'amount' => 500,
        'billing_cycle' => 'monthly',
        'status' => 'active',
    ];

    unset($payload[$field]);

    actingAs($this->landlord)
        ->post(route('landlord.utilities.store', $this->tenancy), $payload)
        ->assertSessionHasErrors($field);
})->with(['utility_type_id', 'amount', 'billing_cycle', 'status']);

test('landlord cannot assign the same utility type twice to one tenancy', function () {
    TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.utilities.store', $this->tenancy), [
            'utility_type_id' => $this->utilityType->id,
            'amount' => 500,
            'billing_cycle' => 'monthly',
            'status' => 'active',
        ])
        ->assertSessionHasErrors('utility_type_id');
});

test('landlord can update a tenancy utility', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
        'amount' => 300,
        'billing_cycle' => 'monthly',
        'status' => 'active',
    ]);

    actingAs($this->landlord)
        ->put(route('landlord.utilities.update', $tenancyUtility), [
            'utility_type_id' => $this->utilityType->id,
            'amount' => 600,
            'billing_cycle' => 'quarterly',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tenancy_utilities', [
        'id' => $tenancyUtility->id,
        'amount' => 600,
        'billing_cycle' => 'quarterly',
    ]);
});

test('landlord can remove a utility with no unpaid bills', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);

    actingAs($this->landlord)
        ->delete(route('landlord.utilities.destroy', $tenancyUtility))
        ->assertRedirect(route('landlord.utilities.index'));

    $this->assertDatabaseMissing('tenancy_utilities', ['id' => $tenancyUtility->id]);
});

test('landlord cannot remove a utility with unpaid bills', function () {
    $tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);

    UtilityBill::factory()->create([
        'tenancy_utility_id' => $tenancyUtility->id,
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->delete(route('landlord.utilities.destroy', $tenancyUtility))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('tenancy_utilities', ['id' => $tenancyUtility->id]);
});
