<?php

use App\Enums\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

it('renders the home/landing page', function (): void {
    $this->get('/')->assertOk();
});

it('renders the login page', function (): void {
    $this->get('/login')->assertOk();
});

it('renders the mobile app page', function (): void {
    $this->get('/resources/mobile-app')->assertOk();
});

// ---------------------------------------------------------------------------
// Landlord routes
// ---------------------------------------------------------------------------

it('renders the landlord dashboard', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/dashboard')->assertOk();
});

it('renders the landlord properties index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/properties')->assertOk();
});

it('renders the landlord units index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/units')->assertOk();
});

it('renders the landlord tenants index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/tenants')->assertOk();
});

it('renders the landlord payments index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/payments')->assertOk();
});

it('renders the landlord rent-bills index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/rent-bills')->assertOk();
});

it('renders the landlord utilities index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/utilities')->assertOk();
});

it('renders the landlord utility-bills index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/utility-bills')->assertOk();
});

it('renders the landlord notifications index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/notifications')->assertOk();
});

// ---------------------------------------------------------------------------
// Tenant routes
// ---------------------------------------------------------------------------

it('renders the tenant dashboard', function (): void {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)->get('/tenant/dashboard')->assertOk();
});

it('renders the tenant payments page', function (): void {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)->get('/tenant/payments')->assertOk();
});

it('renders the tenant rent-bills index', function (): void {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)->get('/tenant/rent-bills')->assertOk();
});

it('renders the tenant utilities page', function (): void {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)->get('/tenant/utilities')->assertOk();
});

it('renders the tenant notifications page', function (): void {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)->get('/tenant/notifications')->assertOk();
});

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

it('renders the admin dashboard', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
});

it('renders the admin properties index', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/admin/properties')->assertOk();
});

it('renders the admin landlords index', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/admin/landlords')->assertOk();
});

// ---------------------------------------------------------------------------
// Role redirect — /dashboard
// ---------------------------------------------------------------------------

it('redirects landlord from /dashboard to landlord dashboard', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/dashboard')->assertRedirect('/landlord/dashboard');
});

it('redirects tenant from /dashboard to tenant dashboard', function (): void {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)->get('/dashboard')->assertRedirect('/tenant/dashboard');
});

it('redirects admin from /dashboard to admin dashboard', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/dashboard')->assertRedirect('/admin/dashboard');
});

// ---------------------------------------------------------------------------
// Cross-role access denial
// ---------------------------------------------------------------------------

it('prevents a tenant from accessing landlord routes', function (): void {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => Role::Tenant, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)->get('/landlord/dashboard')->assertForbidden();
});

it('prevents a landlord from accessing admin routes', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/admin/dashboard')->assertForbidden();
});

it('redirects unauthenticated users to login', function (): void {
    $this->get('/landlord/dashboard')->assertRedirect('/login');
    $this->get('/tenant/dashboard')->assertRedirect('/login');
    $this->get('/admin/dashboard')->assertRedirect('/login');
});
