<?php

use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('tenant_code is auto-generated on creation', function () {
    $tenant = Tenant::factory()->create();

    expect($tenant->tenant_code)->not->toBeNull()
        ->and(strlen($tenant->tenant_code))->toBeGreaterThan(0);
});

test('tenant_code is unique across tenants', function () {
    $codes = Tenant::factory()->count(20)->create()->pluck('tenant_code');

    expect($codes->unique()->count())->toBe(20);
});

test('tenant has full_name fillable', function () {
    $tenant = Tenant::factory()->create(['full_name' => 'Jane Smith']);

    expect($tenant->full_name)->toBe('Jane Smith');
});

test('tenant has email and phone fields', function () {
    $tenant = Tenant::factory()->create(['email' => 'jane@example.com', 'phone' => '0712345678']);

    expect($tenant->email)->toBe('jane@example.com')
        ->and($tenant->phone)->toBe('0712345678');
});

test('tenant can have many tenancies', function () {
    $tenant = Tenant::factory()->create();
    $units = Unit::factory()->count(2)->create();

    Tenancy::factory()->create(['tenant_id' => $tenant->id, 'unit_id' => $units[0]->id, 'status' => 'ended']);
    Tenancy::factory()->create(['tenant_id' => $tenant->id, 'unit_id' => $units[1]->id, 'status' => 'active']);

    expect($tenant->tenancies()->count())->toBe(2);
});
