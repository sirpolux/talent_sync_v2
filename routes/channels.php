<?php

use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users.{userId}', function (User $user, int $userId): bool {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('organizations.{organizationId}.users.{userId}', function (User $user, int $organizationId, int $userId): bool {
    if ((int) $user->id !== (int) $userId) {
        return false;
    }

    return $user->organizations()
        ->where('organizations.id', $organizationId)
        ->exists();
});

Broadcast::channel('organizations.{organizationId}', function (User $user, int $organizationId): bool {
    return $user->organizations()
        ->where('organizations.id', $organizationId)
        ->exists();
});

Broadcast::channel('organizations.{organizationId}.admin', function (User $user, int $organizationId): bool {
    return $user->organizations()
        ->where('organizations.id', $organizationId)
        ->wherePivot('is_org_admin', true)
        ->exists();
});