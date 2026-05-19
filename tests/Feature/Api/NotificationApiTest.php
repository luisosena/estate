<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant = Tenant::create([
        'full_name' => 'Test Tenant',
        'phone' => '0000000000',
        'email' => 'tenant@example.com',
        'emergency_contact_name' => 'Emergency Contact',
        'emergency_contact_phone' => '1111111111',
        'emergency_contact_relation' => 'Friend',
    ]);

    $this->user = User::factory()->create([
        'password' => 'password',
        'role' => 'tenant',
        'tenant_id' => $this->tenant->id,
    ]);

    $this->otherUser = User::factory()->create([
        'password' => 'password',
        'role' => 'tenant',
    ]);
});

it('returns only authenticated users notifications', function () {
    $notification = $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Test', 'message' => 'Test message'],
        'read_at' => null,
    ]);

    $this->otherUser->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Other', 'message' => 'Other message'],
        'read_at' => null,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/v1/tenant/notifications');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $notification->id);
});

it('marks notification as read', function () {
    $notification = $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Test', 'message' => 'Test message'],
        'read_at' => null,
    ]);

    $response = $this->actingAs($this->user)
        ->putJson("/api/v1/tenant/notifications/{$notification->id}/read");

    $response->assertOk()
        ->assertJsonPath('message', 'Notification marked as read');

    $this->assertNotNull($notification->fresh()->read_at);
});

it('marks notification as unread', function () {
    $notification = $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Test', 'message' => 'Test message'],
        'read_at' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->putJson("/api/v1/tenant/notifications/{$notification->id}/unread");

    $response->assertOk()
        ->assertJsonPath('message', 'Notification marked as unread');

    $this->assertNull($notification->fresh()->read_at);
});

it('marks all notifications as read', function () {
    $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Test 1', 'message' => 'Message 1'],
        'read_at' => null,
    ]);

    $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Test 2', 'message' => 'Message 2'],
        'read_at' => null,
    ]);

    $response = $this->actingAs($this->user)
        ->putJson('/api/v1/tenant/notifications/read-all');

    $response->assertOk()
        ->assertJsonPath('message', 'All notifications marked as read');

    $this->user->fresh()->unreadNotifications()->each(function ($n) {
        expect($n->read_at)->not->toBeNull();
    });
});

it('deletes a notification', function () {
    $notification = $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Test', 'message' => 'Test message'],
        'read_at' => null,
    ]);

    $response = $this->actingAs($this->user)
        ->deleteJson("/api/v1/tenant/notifications/{$notification->id}");

    $response->assertOk()
        ->assertJsonPath('message', 'Notification deleted');

    $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
});

it('cannot access another users notification', function () {
    $notification = $this->otherUser->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Other', 'message' => 'Other message'],
        'read_at' => null,
    ]);

    $this->actingAs($this->user)
        ->putJson("/api/v1/tenant/notifications/{$notification->id}/read")
        ->assertNotFound();

    $this->actingAs($this->user)
        ->deleteJson("/api/v1/tenant/notifications/{$notification->id}")
        ->assertNotFound();
});

it('filters notifications by read status', function () {
    $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Unread', 'message' => 'Unread message'],
        'read_at' => null,
    ]);

    $this->user->notifications()->create([
        'id' => (string) Str::orderedUuid(),
        'type' => 'App\Notifications\PaymentReceived',
        'data' => ['title' => 'Read', 'message' => 'Read message'],
        'read_at' => now(),
    ]);

    $unreadResponse = $this->actingAs($this->user)
        ->getJson('/api/v1/tenant/notifications?filter=unread');

    $unreadResponse->assertOk()->assertJsonCount(1, 'data');

    $readResponse = $this->actingAs($this->user)
        ->getJson('/api/v1/tenant/notifications?filter=read');

    $readResponse->assertOk()->assertJsonCount(1, 'data');
});

it('registers push token for authenticated user', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/v1/users/push-token', [
            'token' => 'ExponentPushToken[abc123]',
            'platform' => 'ios',
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'expo_push_token' => 'ExponentPushToken[abc123]',
        'push_platform' => 'ios',
    ]);
});

it('removes push token for authenticated user', function () {
    $this->user->update([
        'expo_push_token' => 'ExponentPushToken[abc123]',
        'push_platform' => 'ios',
    ]);

    $response = $this->actingAs($this->user)
        ->deleteJson('/api/v1/users/push-token');

    $response->assertOk();

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'expo_push_token' => null,
    ]);
});

it('does not expose push token in user API responses', function () {
    $this->user->update([
        'expo_push_token' => 'ExponentPushToken[secret]',
        'push_platform' => 'android',
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/v1/auth/me');

    $response->assertOk()
        ->assertJsonMissing(['expo_push_token' => 'ExponentPushToken[secret]'])
        ->assertJsonMissing(['push_platform' => 'android']);
});
