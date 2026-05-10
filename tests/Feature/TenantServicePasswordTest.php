<?php

use App\Models\User;
use App\Enums\Role;
use App\Services\TenantService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('generates a random temp password different from the username for new tenants', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);
    $property = \App\Models\Property::factory()->create(['owner_id' => $landlord->id]);
    $unit = \App\Models\Unit::factory()->create(['property_id' => $property->id]);

    $result = app(TenantService::class)->createTenantWithTenancy([
        'full_name'    => 'John Doe',
        'email'        => 'john@example.com',
        'phone'        => '0700000000',
        'unit_id'      => $unit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 15000,
        'security_deposit' => 5000,
    ], $landlord);

    expect($result['credentials']['password'])
        ->not->toBe($result['credentials']['username'])
        ->toHaveLength(12);

    expect($result['user']->must_change_password)->toBeTrue();
});

it('sets must_change_password to true for all new tenants', function (): void {
    // Ensure the flag is persisted to the DB, not just on the in-memory model
    $landlord = User::factory()->create(['role' => Role::Landlord]);
    $property = \App\Models\Property::factory()->create(['owner_id' => $landlord->id]);
    $unit = \App\Models\Unit::factory()->create(['property_id' => $property->id]);

    $result = app(TenantService::class)->createTenantWithTenancy([
        'full_name'    => 'Jane Smith',
        'email'        => 'jane@example.com',
        'phone'        => '0711111111',
        'unit_id'      => $unit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 12000,
        'security_deposit' => 4000,
    ], $landlord);

    $this->assertDatabaseHas('users', [
        'id'                   => $result['user']->id,
        'must_change_password' => true,
    ]);
});
