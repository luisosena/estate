<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->user, 'tenant' => $this->tenant] = $this->createApiTenant();
});

test('tenant can view own profile', function () {
    $this->getJson('/api/v1/tenant/profile')
        ->assertOk()
        ->assertJsonFragment(['id' => $this->user->id]);
});

test('tenant can update profile', function () {
    $this->putJson('/api/v1/tenant/profile', ['name' => 'Updated Name'])
        ->assertOk();

    expect($this->user->fresh()->name)->toBe('Updated Name');
});

test('tenant can change password via API', function () {
    $this->putJson('/api/v1/tenant/password', [
        'current_password'      => 'password',
        'password'              => 'NewSecure@123',
        'password_confirmation' => 'NewSecure@123',
    ])->assertOk();
});

test('password change fails with incorrect current password', function () {
    $this->putJson('/api/v1/tenant/password', [
        'current_password'      => 'wrong_password',
        'password'              => 'NewSecure@123',
        'password_confirmation' => 'NewSecure@123',
    ])->assertUnprocessable();
});
