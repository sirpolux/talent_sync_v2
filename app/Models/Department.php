<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Department extends Model
{
    protected $fillable = [
        'organization_id',
        'department_code',
        'description',
        'name',
        'slug',
        'added_by',
        'roles_count',
        'staff_count',
        'is_active',
        'deactivated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'deactivated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Department $department) {
            // Slug is now generated in the controller to enforce tenant-unique slugs and
            // handle collisions in a predictable way.
            // Keep this model hook intentionally empty.
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
