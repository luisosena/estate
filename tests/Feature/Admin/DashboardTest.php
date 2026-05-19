<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->landlord = User::factory()->create(['role' => 'landlord']);
});

test('admin can access the admin dashboard', function () {
    $this->actingAs($this->admin)
        ->get('/admin/dashboard')
        ->assertOk();
});

test('landlord is forbidden from admin dashboard', function () {
    $this->actingAs($this->landlord)
        ->get('/admin/dashboard')
        ->assertForbidden();
});

test('guest is redirected from admin dashboard', function () {
    $this->get('/admin/dashboard')->assertRedirect();
});

test('admin can access audit reports page', function () {
    $this->actingAs($this->admin)
        ->get('/admin/audit-reports')
        ->assertOk();
});

test('landlord is forbidden from audit reports', function () {
    $this->actingAs($this->landlord)
        ->get('/admin/audit-reports')
        ->assertForbidden();
});

test('guest is redirected from audit reports', function () {
    $this->get('/admin/audit-reports')->assertRedirect();
});
