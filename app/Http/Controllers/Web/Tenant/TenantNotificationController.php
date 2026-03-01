<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantNotificationController extends Controller
{
    /**
     * Display tenant notifications.
     */
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return redirect()->route('tenant.dashboard')
                ->with('error', 'Tenant profile not found.');
        }

        $query = $tenant->user->notifications()
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
            $query->where('type', 'like', $request->type . '%');
        }

        $notifications = $query->paginate(20);
        $unreadCount = $tenant->user->unreadNotifications()->count();

        return inertia('tenant/notifications/index', [
            'notifications' => $notifications,
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
    public function markAsRead(Request $request, $id)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json(['error' => 'Tenant profile not found'], 404);
        }

        $notification = $tenant->user->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark a notification as unread.
     */
    public function markAsUnread(Request $request, $id)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json(['error' => 'Tenant profile not found'], 404);
        }

        $notification = $tenant->user->notifications()->findOrFail($id);
        $notification->markAsUnread();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json(['error' => 'Tenant profile not found'], 404);
        }

        $tenant->user->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json(['error' => 'Tenant profile not found'], 404);
        }

        $notification = $tenant->user->notifications()->findOrFail($id);
        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json(['count' => 0]);
        }

        $count = $tenant->user->unreadNotifications()->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications for dropdown.
     */
    public function recent(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json([
                'notifications' => [],
                'unreadCount' => 0
            ]);
        }

        $notifications = $tenant->user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $unreadCount = $tenant->user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }
}
