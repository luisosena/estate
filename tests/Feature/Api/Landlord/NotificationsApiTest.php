<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    ['user' => $this->landlord] = $this->createApiLandlord();
});

function makeLandlordNotification(\App\Models\User $user, bool $read = false): DatabaseNotification
{
    return DatabaseNotification::create([
        'id'              => Str::uuid(),
        'type'            => 'App\\Notifications\\TestNotification',
        'notifiable_type' => \App\Models\User::class,
        'notifiable_id'   => $user->id,
        'data'            => json_encode(['message' => 'Hello landlord']),
        'read_at'         => $read ? now() : null,
    ]);
}

test('landlord can list notifications', function () {
    makeLandlordNotification($this->landlord);

    $this->getJson('/api/v1/landlord/notifications')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

test('landlord can mark notification as read', function () {
    $notification = makeLandlordNotification($this->landlord);

    $this->putJson("/api/v1/landlord/notifications/{$notification->id}/read")
        ->assertOk();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('landlord can delete own notification', function () {
    $notification = makeLandlordNotification($this->landlord);

    $this->deleteJson("/api/v1/landlord/notifications/{$notification->id}")->assertOk();

    $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
});

test('landlord cannot delete another users notification', function () {
    $other             = \App\Models\User::factory()->create(['role' => 'landlord']);
    $otherNotification = makeLandlordNotification($other);

    $this->deleteJson("/api/v1/landlord/notifications/{$otherNotification->id}")
        ->assertNotFound();
});
