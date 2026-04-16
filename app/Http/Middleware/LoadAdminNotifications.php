<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class LoadAdminNotifications
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && $this->isAdminRoute($request)) {
            $user = Auth::user();

            // Check if user is an admin in their current organization
            $currentOrgId = $request->session()->get('current_organization_id');
            if ($currentOrgId) {
                $isAdmin = $user->currentOrganizationMembership()?->is_org_admin ?? false;

                if ($isAdmin) {
                    // Load recent notifications for admin
                    $notifications = $user->notifications()
                        ->orderBy('created_at', 'desc')
                        ->limit(20)
                        ->get()
                        ->map(function ($notification) {
                            $data = $notification->data ?? [];
                            return [
                                'id' => $notification->id,
                                'type' => $notification->type,
                                'notification_type' => $data['type'] ?? $notification->type,
                                'title' => $data['title'] ?? 'Notification',
                                'body' => $data['message'] ?? $data['body'] ?? '',
                                'message' => $data['message'] ?? $data['body'] ?? '',
                                'action_url' => $data['action_url'] ?? $data['url'] ?? null,
                                'url' => $data['action_url'] ?? $data['url'] ?? null,
                                'link' => $data['action_url'] ?? $data['url'] ?? null,
                                'data' => $data,
                                'read_at' => $notification->read_at,
                                'is_read' => !is_null($notification->read_at),
                                'unread' => is_null($notification->read_at),
                                'created_at' => $notification->created_at,
                            ];
                        });

                    $unreadCount = $user->unreadNotifications()->count();

                    // Share with Inertia
                    Inertia::share('notifications', [
                        'notifications' => $notifications,
                        'unreadCount' => $unreadCount,
                        'unread_count' => $unreadCount,
                    ]);
                }
            }
        }

        return $next($request);
    }

    protected function isAdminRoute(Request $request): bool
    {
        $route = $request->route();

        if (!$route) {
            return false;
        }

        $routeName = $route->getName();

        return $routeName && str_starts_with($routeName, 'admin.');
    }
}
