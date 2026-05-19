<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Concerns\ManagesNotifications;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ManagesNotifications;

    /**
     * Get all notifications for the landlord.
     * GET /api/v1/landlord/notifications
     */
    public function index(Request $request)
    {
        return $this->getNotifications($request);
    }

    /**
     * Mark a notification as read.
     * PUT /api/v1/landlord/notifications/{notification}/read
     */
    public function markAsRead(Request $request, string $id)
    {
        return $this->markNotificationAsRead($request, $id);
    }

    /**
     * Mark a notification as unread.
     * PUT /api/v1/landlord/notifications/{notification}/unread
     */
    public function markAsUnread(Request $request, string $id)
    {
        return $this->markNotificationAsUnread($request, $id);
    }

    /**
     * Mark all notifications as read.
     * PUT /api/v1/landlord/notifications/read-all
     */
    public function markAllAsRead(Request $request)
    {
        return $this->markAllNotificationsAsRead($request);
    }

    /**
     * Delete a notification.
     * DELETE /api/v1/landlord/notifications/{notification}
     */
    public function destroy(Request $request, string $id)
    {
        return $this->deleteNotification($request, $id);
    }
}
