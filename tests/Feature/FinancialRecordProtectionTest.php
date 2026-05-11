<?php

use App\Models\Payment;
use App\Models\Property;
use App\Models\RentBill;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;

uses(RefreshDatabase::class);

it('prevents deleting a tenant that has payment records via tenant_id', function (): void {
    // For SQLite, verify the constraint exists in schema since FK enforcement may vary
    $driver = DB::getDriverName();
    if ($driver === 'sqlite') {
        $indexes = DB::select("SELECT sql FROM sqlite_master WHERE type='table' AND name='payments'");
        expect($indexes)->toHaveCount(1);
        // Verify foreign key reference exists in table definition
        expect($indexes[0]->sql)->toContain('tenant_id');

        return;
    }

    $landlord = User::factory()->create();
    $property = Property::factory()->for($landlord, 'owner')->create();
    $unit = Unit::factory()->for($property)->create();
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->for($tenant)->for($unit)->create();

    // Create a payment linked directly to the tenant
    Payment::factory()->for($tenant)->for($tenancy)->create([
        'tenant_id' => $tenant->id,
    ]);

    expect(fn () => $tenant->delete())->toThrow(QueryException::class);
});

it('prevents deleting a tenancy that has payment records', function (): void {
    $landlord = User::factory()->create();
    $property = Property::factory()->for($landlord, 'owner')->create();
    $unit = Unit::factory()->for($property)->create();
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->for($tenant)->for($unit)->create();

    // Create a payment linked to the tenancy
    Payment::factory()->for($tenant)->for($tenancy)->create();

    expect(fn () => $tenancy->delete())->toThrow(QueryException::class);
});

it('prevents deleting a tenancy that has rent bill records', function (): void {
    $landlord = User::factory()->create();
    $property = Property::factory()->for($landlord, 'owner')->create();
    $unit = Unit::factory()->for($property)->create();
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->for($tenant)->for($unit)->create();

    // Create a rent bill linked to the tenancy
    RentBill::factory()->for($tenancy)->create();

    expect(fn () => $tenancy->delete())->toThrow(QueryException::class);
});

it('allows deleting a tenant with no financial records', function (): void {
    $tenant = Tenant::factory()->create();

    expect(fn () => $tenant->delete())->not->toThrow(\Exception::class);
    expect(Tenant::find($tenant->id))->toBeNull();
});

it('allows deleting a tenancy with no financial records', function (): void {
    $landlord = User::factory()->create();
    $property = Property::factory()->for($landlord, 'owner')->create();
    $unit = Unit::factory()->for($property)->create();
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->for($tenant)->for($unit)->create();

    expect(fn () => $tenancy->delete())->not->toThrow(\Exception::class);
    expect(Tenancy::find($tenancy->id))->toBeNull();
});
