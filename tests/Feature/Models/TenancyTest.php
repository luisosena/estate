<?php

use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant = Tenant::factory()->create();
    $this->unit = Unit::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
        'monthly_rent' => 12000,
    ]);
});

test('tenancy belongs to tenant', function () {
    expect($this->tenancy->tenant)->not->toBeNull()
        ->and($this->tenancy->tenant->id)->toBe($this->tenant->id);
});

test('tenancy belongs to unit', function () {
    expect($this->tenancy->unit)->not->toBeNull()
        ->and($this->tenancy->unit->id)->toBe($this->unit->id);
});

test('active scope returns only active tenancies', function () {
    Tenancy::factory()->create(['tenant_id' => $this->tenant->id, 'unit_id' => Unit::factory()->create()->id, 'status' => 'ended']);

    $active = Tenancy::where('status', 'active')->get();

    expect($active->every(fn ($t) => $t->status === 'active'))->toBeTrue();
});

test('ended scope returns only ended tenancies', function () {
    Tenancy::factory()->create(['tenant_id' => $this->tenant->id, 'unit_id' => Unit::factory()->create()->id, 'status' => 'ended']);

    $ended = Tenancy::where('status', 'ended')->get();

    expect($ended->every(fn ($t) => $t->status === 'ended'))->toBeTrue();
});

test('tenancy monthly_rent is stored correctly', function () {
    expect((float) $this->tenancy->monthly_rent)->toBe(12000.0);
});
