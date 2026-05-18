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

test('landlord is redirected from admin dashboard', function () {
    $this->actingAs($this->landlord)
        ->get('/admin/dashboard')
        ->assertRedirect();
});

test('guest is redirected from admin dashboard', function () {
    $this->get('/admin/dashboard')->assertRedirect();
});
