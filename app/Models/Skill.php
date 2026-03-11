<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    protected $fillable = [
        'organization_id',
        'name',
        'description',
        'type',
        'category',
        'applies_to_all_departments',
        'department_id',
        'added_by',
        'is_active',
    ];

    protected $casts = [
        'applies_to_all_departments' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Skill belongs to Organization (null for global/system skills)
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Skill can optionally belong to a Department (when not applies_to_all_departments)
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * User who added/created the skill (null for seeded/global)
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    /**
     * Skill can be required by many positions
     */
    public function positions(): BelongsToMany
    {
        return $this->belongsToMany(Position::class, 'position_skills')
            ->withPivot(['required_proficiency', 'is_required', 'minimum_score'])
            ->withTimestamps();
    }
}
