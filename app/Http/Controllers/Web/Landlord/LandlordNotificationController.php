<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class LandlordNotificationController extends Controller
{
    /**
     * Display the landlord's notifications.
     */
    public function index(Request $request)
    {
        $landlord = $request->user();

        $query = $landlord->notifications()
            ->orderBy('created_at', 'desc');

        // Filter by read status
        if ($request->has('filter')) {
            switch ($request->filter) {
                case 'unread':
                    $query->whereNull('read_at');
                    break;
                case 'read':
                    $query->whereNotNull('read_at');
                    break;
            }
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', 'like', $request->type.'%');
        }

        $notifications = $query->paginate(15);
        $unreadCount = $landlord->unreadNotifications()->count();

        return Inertia::render('landlord/notifications/index', [
            'notifications' => NotificationResource::collection($notifications),
            'unreadCount' => $unreadCount,
            'filters' => [
                'filter' => $request->filter ?? 'all',
                'type' => $request->type ?? 'all',
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(DatabaseNotification $notification)
    {
        $this->authorize('update', $notification);

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark a notification as unread.
     */
    public function markAsUnread(DatabaseNotification $notification)
    {
        $this->authorize('update', $notification);

        if ($notification->read_at) {
            $notification->update(['read_at' => null]);
        }

        return back()->with('success', 'Notification marked as unread.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $landlord = $request->user();

        $landlord->unreadNotifications()->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a notification.
     */
    public function destroy(DatabaseNotification $notification)
    {
        $this->authorize('delete', $notification);

        $notification->delete();

        return back()->with('success', 'Notification deleted.');
    }

    /**
     * Get unread notifications count for API usage.
     */
    public function unreadCount(Request $request)
    {
        $landlord = $request->user();

        return response()->json([
            'count' => $landlord->unreadNotifications()->count(),
        ]);
    }

    /**
     * Get recent notifications for dropdown/panel.
     */
    public function recent(Request $request)
    {
        $landlord = $request->user();

        $notifications = $landlord->notifications()
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'notifications' => NotificationResource::collection($notifications),
            'unreadCount' => $landlord->unreadNotifications()->count(),
        ]);
    }
}
