<?php

use App\Models\Tenant;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('tenant.dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['role' => 'tenant', 'tenant_id' => $tenant->id]);
    $this->actingAs($user);

    $this->get(route('tenant.dashboard'))->assertOk();
});
