<?php

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('generates a unique tenant_code based on the actual row id after insert', function (): void {
    $tenant = Tenant::factory()->create(['tenant_code' => null, 'email' => 'test1@example.com']);

    expect($tenant->fresh()->tenant_code)
        ->toMatch('/^TEN-\d{5}$/')
        ->toBe('TEN-'.str_pad($tenant->id, 5, '0', STR_PAD_LEFT));
});

it('does not overwrite an explicitly provided tenant_code', function (): void {
    $tenant = Tenant::factory()->create(['tenant_code' => 'TEN-CUSTOM', 'email' => 'test2@example.com']);

    expect($tenant->fresh()->tenant_code)->toBe('TEN-CUSTOM');
});

it('cannot create two tenants with the same tenant_code', function (): void {
    Tenant::factory()->create(['tenant_code' => 'TEN-TEST01', 'email' => 'test3@example.com']);

    expect(fn () => Tenant::factory()->create(['tenant_code' => 'TEN-TEST01', 'email' => 'test4@example.com']))
        ->toThrow(\Illuminate\Database\QueryException::class);
});
