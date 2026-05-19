<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

trait ManagesNotifications
{
    /**
     * Get paginated notifications for the authenticated user.
     */
    protected function getNotifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15);

        $query = $user->notifications()->orderBy('created_at', 'desc');

        if ($request->has('filter')) {
            match ($request->filter) {
                'unread' => $query->whereNull('read_at'),
                'read' => $query->whereNotNull('read_at'),
                default => null,
            };
        }

        $paginated = $query->paginate($perPage);

        $notifications = $paginated->getCollection()->map(function ($notification) {
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

        $response = new LengthAwarePaginator(
            $notifications,
            $paginated->total(),
            $paginated->perPage(),
            $paginated->currentPage(),
            $paginated->getOptions()
        );

        return response()->json([
            'data' => $response->items(),
            'meta' => [
                'current_page' => $response->currentPage(),
                'per_page' => $response->perPage(),
                'total' => $response->total(),
                'total_pages' => $response->lastPage(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    /**
     * Mark a notification as read.
     */
    protected function markNotificationAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->firstOrFail();

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark a notification as unread.
     */
    protected function markNotificationAsUnread(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->firstOrFail();

        if ($notification->read_at) {
            $notification->update(['read_at' => null]);
        }

        return response()->json(['message' => 'Notification marked as unread']);
    }

    /**
     * Mark all notifications as read.
     */
    protected function markAllNotificationsAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a notification.
     */
    protected function deleteNotification(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->firstOrFail();
        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}
