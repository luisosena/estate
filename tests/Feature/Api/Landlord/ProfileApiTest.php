<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord] = $this->createApiLandlord();
});

test('landlord can view own profile', function () {
    $this->getJson('/api/v1/landlord/profile')
        ->assertOk()
        ->assertJsonFragment(['id' => $this->landlord->id]);
});

test('landlord can update profile name', function () {
    $this->putJson('/api/v1/landlord/profile', ['name' => 'New Name'])
        ->assertOk();

    expect($this->landlord->fresh()->name)->toBe('New Name');

    $this->assertDatabaseHas('security_events', [
        'user_id' => $this->landlord->id,
        'event_type' => \App\Models\SecurityEvent::EVENT_PROFILE_UPDATED,
        'severity' => \App\Models\SecurityEvent::SEVERITY_LOW,
    ]);
});

test('landlord can change password via API', function () {
    $this->putJson('/api/v1/landlord/password', [
        'current_password'      => 'password',
        'password'              => 'NewSecure@123',
        'password_confirmation' => 'NewSecure@123',
    ])->assertOk();

    $this->assertDatabaseHas('security_events', [
        'user_id' => $this->landlord->id,
        'event_type' => \App\Models\SecurityEvent::EVENT_PASSWORD_CHANGED,
        'severity' => \App\Models\SecurityEvent::SEVERITY_MEDIUM,
    ]);
});

test('password change fails with wrong current password', function () {
    $this->putJson('/api/v1/landlord/password', [
        'current_password'      => 'wrong_password',
        'password'              => 'NewSecure@123',
        'password_confirmation' => 'NewSecure@123',
    ])->assertUnprocessable();
});
