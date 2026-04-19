<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord] = $this->createApiLandlord();
});

test('landlord can view own profile', function () {
    $this->getJson('/api/landlord/profile')
        ->assertOk()
        ->assertJsonFragment(['id' => $this->landlord->id]);
});

test('landlord can update profile name', function () {
    $this->putJson('/api/landlord/profile', ['name' => 'New Name'])
        ->assertOk();

    expect($this->landlord->fresh()->name)->toBe('New Name');
});

test('landlord can change password via API', function () {
    $this->putJson('/api/landlord/password', [
        'current_password'      => 'password',
        'password'              => 'NewSecure@123',
        'password_confirmation' => 'NewSecure@123',
    ])->assertOk();
});

test('password change fails with wrong current password', function () {
    $this->putJson('/api/landlord/password', [
        'current_password'      => 'wrong_password',
        'password'              => 'NewSecure@123',
        'password_confirmation' => 'NewSecure@123',
    ])->assertUnprocessable();
});
