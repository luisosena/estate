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
    $this->tenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'utility_type_id' => $this->utilityType->id,
    ]);
    $this->utilityBill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $this->tenancyUtility->id,
        'status' => 'pending',
    ]);
});

test('guest is redirected from utility bill index', function () {
    get(route('landlord.utility-bills.index'))->assertRedirect(route('login'));
});

test('landlord can view utility bill index without lazy loading violation', function () {
    actingAs($this->landlord)
        ->get(route('landlord.utility-bills.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/utility-bills/index'));
});

test('landlord can view a specific utility bill', function () {
    actingAs($this->landlord)
        ->get(route('landlord.utility-bills.show', $this->utilityBill))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/utility-bills/show'));
});

test('landlord can waive a pending utility bill', function () {
    actingAs($this->landlord)
        ->post(route('landlord.utility-bills.waive', $this->utilityBill), [
            'notes' => 'Waiving due to billing error.',
        ])
        ->assertRedirect(route('landlord.utility-bills.show', $this->utilityBill));

    $this->assertDatabaseHas('utility_bills', [
        'id' => $this->utilityBill->id,
        'status' => 'waived',
    ]);
});

test('landlord cannot waive an already paid utility bill', function () {
    $this->utilityBill->update(['status' => 'paid']);

    actingAs($this->landlord)
        ->post(route('landlord.utility-bills.waive', $this->utilityBill))
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('landlord cannot waive an already waived utility bill', function () {
    $this->utilityBill->update(['status' => 'waived']);

    actingAs($this->landlord)
        ->post(route('landlord.utility-bills.waive', $this->utilityBill))
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('landlord cannot waive a utility bill they do not own', function () {
    $otherLandlord = User::factory()->create(['role' => 'landlord']);
    $otherProperty = Property::factory()->create(['owner_id' => $otherLandlord->id]);
    $otherUnit = Unit::factory()->create(['property_id' => $otherProperty->id]);
    $otherTenancy = Tenancy::factory()->create(['unit_id' => $otherUnit->id]);
    $otherUtilityType = UtilityType::factory()->create(['is_active' => true]);
    $otherTenancyUtility = TenancyUtility::factory()->create([
        'tenancy_id' => $otherTenancy->id,
        'utility_type_id' => $otherUtilityType->id,
    ]);
    $otherBill = UtilityBill::factory()->create([
        'tenancy_utility_id' => $otherTenancyUtility->id,
        'status' => 'pending',
    ]);

    actingAs($this->landlord)
        ->post(route('landlord.utility-bills.waive', $otherBill))
        ->assertForbidden();
});

test('tenant user can view utility bill index (policy allows all roles)', function () {
    $user = User::factory()->create(['role' => 'tenant']);
    actingAs($user)->get(route('landlord.utility-bills.index'))->assertSuccessful();
});
