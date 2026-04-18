<?php

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
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id]);
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'unit_id' => $this->unit->id,
        'tenant_id' => $this->tenant->id,
        'status' => 'active',
    ]);
    $this->rentBill = RentBill::factory()->create([
        'tenancy_id' => $this->tenancy->id,
        'status' => 'pending',
    ]);
});

test('guest is redirected from rent bill index', function () {
    get(route('landlord.rent-bills.index'))->assertRedirect(route('login'));
});

test('landlord can view rent bill index', function () {
    actingAs($this->landlord)
        ->get(route('landlord.rent-bills.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/rent-bills/index'));
});

test('landlord can view a specific rent bill', function () {
    actingAs($this->landlord)
        ->get(route('landlord.rent-bills.show', $this->rentBill))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('landlord/rent-bills/show'));
});

test('landlord can waive a pending rent bill', function () {
    actingAs($this->landlord)
        ->post(route('landlord.rent-bills.waive', $this->rentBill), [
            'notes' => 'Waiving due to hardship.',
        ])
        ->assertRedirect(route('landlord.rent-bills.show', $this->rentBill));

    $this->assertDatabaseHas('rent_bills', [
        'id' => $this->rentBill->id,
        'status' => 'waived',
    ]);
});

test('landlord cannot waive an already waived rent bill', function () {
    $this->rentBill->update(['status' => 'waived']);

    actingAs($this->landlord)
        ->post(route('landlord.rent-bills.waive', $this->rentBill))
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('landlord cannot waive an already paid rent bill', function () {
    $this->rentBill->update(['status' => 'paid']);

    actingAs($this->landlord)
        ->post(route('landlord.rent-bills.waive', $this->rentBill))
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('landlord cannot waive a rent bill they do not own', function () {
    $otherLandlord = User::factory()->create(['role' => 'landlord']);
    $otherProperty = Property::factory()->create(['owner_id' => $otherLandlord->id]);
    $otherUnit = Unit::factory()->create(['property_id' => $otherProperty->id]);
    $otherTenancy = Tenancy::factory()->create(['unit_id' => $otherUnit->id]);
    $otherBill = RentBill::factory()->create(['tenancy_id' => $otherTenancy->id, 'status' => 'pending']);

    actingAs($this->landlord)
        ->post(route('landlord.rent-bills.waive', $otherBill))
        ->assertForbidden();
});

test('tenant user can view rent bill index (policy allows all roles)', function () {
    $user = User::factory()->create(['role' => 'tenant']);
    actingAs($user)->get(route('landlord.rent-bills.index'))->assertSuccessful();
});
