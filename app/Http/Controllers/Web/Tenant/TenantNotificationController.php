<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\NotificationResource;
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

        $notifications = $query->paginate(15);
        $unreadCount = $tenant->user->unreadNotifications()->count();

        return Inertia::render('tenant/notifications/index', [
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
    public function markAsRead(Request $request, $id)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return redirect()->back()->with('error', 'Tenant profile not found.');
        }

        $notification = $tenant->user->notifications()->findOrFail($id);
        
        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark a notification as unread.
     */
    public function markAsUnread(Request $request, $id)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return redirect()->back()->with('error', 'Tenant profile not found.');
        }

        $notification = $tenant->user->notifications()->findOrFail($id);
        
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
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return redirect()->back()->with('error', 'Tenant profile not found.');
        }

        $tenant->user->unreadNotifications()->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return redirect()->back()->with('error', 'Tenant profile not found.');
        }

        $notification = $tenant->user->notifications()->findOrFail($id);
        $notification->delete();

        return back()->with('success', 'Notification deleted.');
    }

    /**
     * Get unread notifications count for API/Poll usage.
     */
    public function unreadCount(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return response()->json(['count' => 0]);
        }

        return response()->json([
            'count' => $tenant->user->unreadNotifications()->count()
        ]);
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

        return response()->json([
            'notifications' => NotificationResource::collection($notifications),
            'unreadCount' => $tenant->user->unreadNotifications()->count()
        ]);
    }
}
