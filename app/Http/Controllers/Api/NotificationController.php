<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->notifications();

        // Filter by read status
        if ($request->has('read')) {
            $isRead = filter_var($request->read, FILTER_VALIDATE_BOOLEAN);
            $query->whereNotNull('read_at', $isRead);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->whereJsonContains('data->type', $request->type);
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function show(DatabaseNotification $notification): JsonResponse
    {
        // Ensure user owns this notification
        if ($notification->notifiable_id !== auth()->id()) {
            abort(403);
        }

        return response()->json($notification);
    }

    public function update(Request $request, DatabaseNotification $notification): JsonResponse
    {
        // Ensure user owns this notification
        if ($notification->notifiable_id !== auth()->id()) {
            abort(403);
        }

        $notification->update($request->only(['read_at']));

        return response()->json($notification);
    }

    public function destroy(DatabaseNotification $notification): JsonResponse
    {
        // Ensure user owns this notification
        if ($notification->notifiable_id !== auth()->id()) {
            abort(403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    public function markAsRead(DatabaseNotification $notification): JsonResponse
    {
        // Ensure user owns this notification
        if ($notification->notifiable_id !== auth()->id()) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json($notification);
    }

    public function markAllAsRead(): JsonResponse
    {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
            'unread_count' => 0,
        ]);
    }

    public function unreadCount(): JsonResponse
    {
        return response()->json([
            'unread_count' => auth()->user()->unreadNotifications()->count(),
        ]);
    }
}