<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class NotificationPreferenceController extends Controller
{
    public function index(): JsonResponse
    {
        $preferences = NotificationPreference::where('user_id', auth()->id())
            ->get()
            ->keyBy('notification_type');

        // Return defaults for types that don't have preferences set
        $defaultTypes = [
            'organization_invitation',
            'admin_leave_request_submitted',
            'leave_request_reviewed',
            'training_session_application',
            'training_request_updated',
        ];

        foreach ($defaultTypes as $type) {
            if (!$preferences->has($type)) {
                $preferences[$type] = new NotificationPreference([
                    'user_id' => auth()->id(),
                    'notification_type' => $type,
                    'email_enabled' => true,
                    'database_enabled' => true,
                    'broadcast_enabled' => true,
                ]);
            }
        }

        return response()->json($preferences->values());
    }

    public function update(Request $request, string $notificationType): JsonResponse
    {
        $validated = $request->validate([
            'email_enabled' => 'boolean',
            'database_enabled' => 'boolean',
            'broadcast_enabled' => 'boolean',
        ]);

        $preference = NotificationPreference::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'notification_type' => $notificationType,
            ],
            $validated
        );

        return response()->json($preference);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*.notification_type' => 'required|string',
            'preferences.*.email_enabled' => 'boolean',
            'preferences.*.database_enabled' => 'boolean',
            'preferences.*.broadcast_enabled' => 'boolean',
        ]);

        $updated = [];
        foreach ($validated['preferences'] as $prefData) {
            $preference = NotificationPreference::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'notification_type' => $prefData['notification_type'],
                ],
                [
                    'email_enabled' => $prefData['email_enabled'] ?? true,
                    'database_enabled' => $prefData['database_enabled'] ?? true,
                    'broadcast_enabled' => $prefData['broadcast_enabled'] ?? true,
                ]
            );
            $updated[] = $preference;
        }

        return response()->json($updated);
    }
}