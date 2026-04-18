<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->landlord = User::factory()->create(['role' => 'landlord']);
});

test('guest is redirected from landlord management', function () {
    get(route('admin.landlords.index'))->assertRedirect(route('login'));
});

test('admin can view landlord management index', function () {
    actingAs($this->admin)
        ->get(route('admin.landlords.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/landlords/index')->has('landlords'));
});

test('landlord cannot access admin landlord management', function () {
    actingAs($this->landlord)
        ->get(route('admin.landlords.index'))
        ->assertForbidden();
});

test('tenant cannot access admin landlord management', function () {
    $tenant = User::factory()->create(['role' => 'tenant']);
    actingAs($tenant)
        ->get(route('admin.landlords.index'))
        ->assertForbidden();
});
