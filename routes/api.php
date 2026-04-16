<?php

use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\NotificationPreferenceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Notification API routes
Route::middleware(['auth'])->group(function () {
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::post('notifications/{notification}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('notifications/unread/count', [NotificationController::class, 'unreadCount']);

    // Notification preferences
    Route::get('notification-preferences', [NotificationPreferenceController::class, 'index']);
    Route::put('notification-preferences/{notificationType}', [NotificationPreferenceController::class, 'update']);
    Route::post('notification-preferences/bulk-update', [NotificationPreferenceController::class, 'bulkUpdate']);
});