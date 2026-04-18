<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Notifications\DatabaseNotification;

class NotificationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the notification.
     */
    public function view(User $user, DatabaseNotification $notification): bool
    {
        return (string) $user->id === (string) $notification->notifiable_id &&
               get_class($user) === $notification->notifiable_type;
    }

    /**
     * Determine whether the user can update the notification.
     */
    public function update(User $user, DatabaseNotification $notification): bool
    {
        return (string) $user->id === (string) $notification->notifiable_id &&
               get_class($user) === $notification->notifiable_type;
    }

    /**
     * Determine whether the user can delete the notification.
     */
    public function delete(User $user, DatabaseNotification $notification): bool
    {
        return (string) $user->id === (string) $notification->notifiable_id &&
               get_class($user) === $notification->notifiable_type;
    }
}
