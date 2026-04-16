<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notification_type',
        'email_enabled',
        'database_enabled',
        'broadcast_enabled',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'database_enabled' => 'boolean',
        'broadcast_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get preference for a specific notification type
     */
    public static function getForUser(int $userId, string $notificationType): self
    {
        return static::firstOrCreate(
            ['user_id' => $userId, 'notification_type' => $notificationType],
            [
                'email_enabled' => true,
                'database_enabled' => true,
                'broadcast_enabled' => true,
            ]
        );
    }

    /**
     * Check if user wants email for this notification type
     */
    public static function userWantsEmail(int $userId, string $notificationType): bool
    {
        $preference = static::getForUser($userId, $notificationType);
        return $preference->email_enabled;
    }

    /**
     * Check if user wants database notification for this type
     */
    public static function userWantsDatabase(int $userId, string $notificationType): bool
    {
        $preference = static::getForUser($userId, $notificationType);
        return $preference->database_enabled;
    }

    /**
     * Check if user wants broadcast notification for this type
     */
    public static function userWantsBroadcast(int $userId, string $notificationType): bool
    {
        $preference = static::getForUser($userId, $notificationType);
        return $preference->broadcast_enabled;
    }
}