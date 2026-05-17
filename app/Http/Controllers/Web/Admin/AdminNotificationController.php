<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;

class AdminNotificationController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->user();

        $query = $admin->notifications()->orderBy('created_at', 'desc');

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

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', 'like', $request->type.'%');
        }

        $notifications = $query->paginate(15);
        $unreadCount = $admin->unreadNotifications()->count();

        return Inertia::render('admin/notifications/index', [
            'notifications' => NotificationResource::collection($notifications),
            'unreadCount' => $unreadCount,
            'filters' => [
                'filter' => $request->filter ?? 'all',
                'type' => $request->type ?? 'all',
            ],
        ]);
    }

    public function markAsRead(DatabaseNotification $notification)
    {
        $this->authorize('update', $notification);

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return back()->with('success', 'Notification marked as read.');
    }

    public function markAsUnread(DatabaseNotification $notification)
    {
        $this->authorize('update', $notification);

        if ($notification->read_at) {
            $notification->update(['read_at' => null]);
        }

        return back()->with('success', 'Notification marked as unread.');
    }

    public function markAllAsRead(Request $request)
    {
        $admin = $request->user();
        $admin->unreadNotifications()->update(['read_at' => now()]);
        return back()->with('success', 'All notifications marked as read.');
    }

    public function destroy(DatabaseNotification $notification)
    {
        $this->authorize('delete', $notification);
        $notification->delete();
        return back()->with('success', 'Notification deleted.');
    }

    public function unreadCount(Request $request)
    {
        $admin = $request->user();
        return response()->json(['count' => $admin->unreadNotifications()->count()]);
    }

    public function recent(Request $request)
    {
        $admin = $request->user();
        $notifications = $admin->notifications()
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'notifications' => NotificationResource::collection($notifications),
            'unreadCount' => $admin->unreadNotifications()->count(),
        ]);
    }
}
