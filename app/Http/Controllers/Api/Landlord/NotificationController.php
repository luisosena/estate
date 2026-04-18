<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the landlord.
     * GET /api/v1/landlord/notifications
     */
    public function index(Request $request)
    {
        $landlord = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

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

        $totalItems = $query->count();
        $notifications = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($notification) {
                $data = $notification->data;

                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $data['title'] ?? 'Notification',
                    'message' => $data['message'] ?? '',
                    'priority' => $data['priority'] ?? 'medium',
                    'created_at' => $notification->created_at,
                    'read_at' => $notification->read_at,
                    'data' => $data,
                ];
            });

        $totalPages = ceil($totalItems / $perPage);
        $unreadCount = $landlord->unreadNotifications()->count();

        return response()->json([
            'data' => $notifications,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     * PUT /api/v1/landlord/notifications/{notification}/read
     */
    public function markAsRead(Request $request, string $id)
    {
        $landlord = $request->user();

        $notification = $landlord->notifications()
            ->where('id', $id)
            ->firstOrFail();

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all notifications as read.
     * PUT /api/v1/landlord/notifications/read-all
     */
    public function markAllAsRead(Request $request)
    {
        $landlord = $request->user();

        $landlord->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Delete a notification.
     * DELETE /api/v1/landlord/notifications/{notification}
     */
    public function destroy(Request $request, string $id)
    {
        $landlord = $request->user();

        $notification = $landlord->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted',
        ]);
    }
}
