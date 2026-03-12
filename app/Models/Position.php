<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Position extends Model
{
    protected $fillable = [
        'organization_id',
        'department_id',
        'parent_position_id',
        'grading_system_id',
        'name',
        'slug',
        'min_months_in_role',
        'responsibilities',
        'level',
        'role_id',
        'duration_before_promotion',
        'duration_before_promotion_type',
        'reports_to_position_id',
        'added_by',
    ];

    /**
     * Position belongs to Organization
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Position belongs to Department
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Position can have many users assigned
     * Users are linked through the organization_user pivot table
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organization_user')
            ->using('App\\Models\\OrganizationUser')
            ->withPivot([
                'organization_id',
                'is_org_admin',
                'is_sub_admin',
                'is_employee',
                'is_trainer',
                'can_manage_courses',
                'can_manage_reporting',
                'employee_code',
                'phone',
                'employment_type',
                'work_mode',
                'employment_date',
                'onboarding_stage',
                'gender',
                'nationality',
                'state',
                'department_id',
                'date_started_current_position',
                'manager_user_id',
                'membership_status',
                'membership_confirmed_at',
                'membership_confirmed_by_user_id',
            ])
            ->withTimestamps();
    }

    /**
     * Parent position in promotion hierarchy (next level up)
     */
    public function parentPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'parent_position_id');
    }

    /**
     * Child positions in promotion hierarchy (lower levels)
     */
    public function childPositions(): HasMany
    {
        return $this->hasMany(Position::class, 'parent_position_id');
    }

    /**
     * Position belongs to GradingSystem
     */
    public function gradingSystem(): BelongsTo
    {
        return $this->belongsTo(GradingSystem::class);
    }

    /**
     * Position reports to another position (reporting hierarchy)
     */
    public function reportsToPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'reports_to_position_id');
    }

    /**
     * Positions that report to this position
     */
    public function reportingPositions(): HasMany
    {
        return $this->hasMany(Position::class, 'reports_to_position_id');
    }

    /**
     * Position can require many skills
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'position_skills')
            ->withPivot(['required_proficiency', 'is_required', 'minimum_score'])
            ->withTimestamps();
    }

    /**
     * Get full promotion path upward
     */
    public function getPromotionPath(): Collection
    {
        $path = collect([$this]);
        $current = $this;

        while ($current->parentPosition) {
            $path->push($current->parentPosition);
            $current = $current->parentPosition;
        }

        return $path->reverse(); // Entry level first
    }

    /**
     * Get all positions that can promote to this one
     */
    public function getEligibleFromPositions(): Collection
    {
        return Position::where('parent_position_id', $this->id)->get();
    }
}
