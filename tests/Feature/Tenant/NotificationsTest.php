<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant = Tenant::factory()->create();
    $this->user = User::factory()->create(['role' => 'tenant', 'tenant_id' => $this->tenant->id]);
});

/** Helper to insert a DB notification directly. */
function makeNotification(User $user, bool $read = false): DatabaseNotification
{
    return DatabaseNotification::create([
        'id' => Str::uuid(),
        'type' => 'App\\Notifications\\TestNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $user->id,
        'data' => json_encode(['message' => 'Test notification']),
        'read_at' => $read ? now() : null,
    ]);
}

test('tenant can view notifications index', function () {
    $this->actingAs($this->user)
        ->get('/tenant/notifications')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('notifications'));
});

test('tenant can mark a notification as read', function () {
    $notification = makeNotification($this->user);

    $this->actingAs($this->user)
        ->put("/tenant/notifications/{$notification->id}/read")
        ->assertRedirect();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('tenant can delete own notification', function () {
    $notification = makeNotification($this->user);

    $this->actingAs($this->user)
        ->delete("/tenant/notifications/{$notification->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
});

test('tenant cannot delete another tenants notification', function () {
    $otherTenant = Tenant::factory()->create();
    $otherUser = User::factory()->create(['role' => 'tenant', 'tenant_id' => $otherTenant->id]);
    $notification = makeNotification($otherUser);

    $this->actingAs($this->user)
        ->delete("/tenant/notifications/{$notification->id}")
        ->assertForbidden();
});

test('guest is redirected from notifications page', function () {
    $this->get('/tenant/notifications')->assertRedirect('/login');
});
