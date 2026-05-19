<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Concerns\ManagesNotifications;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ManagesNotifications;

    public function index(Request $request)
    {
        return $this->getNotifications($request);
    }

    public function markAsRead(Request $request, string $id)
    {
        return $this->markNotificationAsRead($request, $id);
    }

    public function markAsUnread(Request $request, string $id)
    {
        return $this->markNotificationAsUnread($request, $id);
    }

    public function markAllAsRead(Request $request)
    {
        return $this->markAllNotificationsAsRead($request);
    }

    public function destroy(Request $request, string $id)
    {
        return $this->deleteNotification($request, $id);
    }
}
