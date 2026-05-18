<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $tenant = $request->user();
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);

        $query = $tenant->notifications()
            ->orderBy('created_at', 'desc');

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
        $unreadCount = $tenant->unreadNotifications()->count();

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

    public function markAsRead(Request $request, string $id)
    {
        $tenant = $request->user();
        $notification = $tenant->notifications()->where('id', $id)->firstOrFail();

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $tenant = $request->user();
        $tenant->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy(Request $request, string $id)
    {
        $tenant = $request->user();
        $notification = $tenant->notifications()->where('id', $id)->firstOrFail();
        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}
