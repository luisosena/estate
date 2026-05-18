<?php

namespace Tests;

use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Enable foreign key constraints for SQLite
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        }
    }

    /**
     * Create a landlord user with a full property → unit chain.
     * Returns ['user', 'property', 'unit'].
     *
     * @return array{user: User, property: Property, unit: Unit}
     */
    protected function createApiLandlord(): array
    {
        $user = User::factory()->create(['role' => 'landlord']);
        $property = Property::factory()->create(['owner_id' => $user->id]);
        $unit = Unit::factory()->create([
            'property_id' => $property->id,
            'status' => 'available',
        ]);

        Sanctum::actingAs($user, ['*']);

        return compact('user', 'property', 'unit');
    }

    /**
     * Create a tenant user with a complete chain:
     *   Tenant → User → Tenancy → Unit → Property (owned by a landlord).
     * Returns ['user', 'tenant', 'tenancy', 'unit', 'property', 'landlord'].
     *
     * @return array{user: User, tenant: Tenant, tenancy: Tenancy, unit: Unit, property: Property, landlord: User}
     */
    protected function createApiTenant(): array
    {
        $landlord = User::factory()->create(['role' => 'landlord']);
        $property = Property::factory()->create(['owner_id' => $landlord->id]);
        $unit = Unit::factory()->create([
            'property_id' => $property->id,
            'status' => 'occupied',
        ]);

        $tenant = Tenant::factory()->create();
        $user = User::factory()->create([
            'role' => 'tenant',
            'tenant_id' => $tenant->id,
        ]);

        $tenancy = Tenancy::factory()->create([
            'tenant_id' => $tenant->id,
            'unit_id' => $unit->id,
            'status' => 'active',
            'monthly_rent' => 15000,
        ]);

        Sanctum::actingAs($user, ['*']);

        return compact('user', 'tenant', 'tenancy', 'unit', 'property', 'landlord');
    }
}
