<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    protected $guarded = [];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot([
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
                'position_id',
                'date_started_current_position',
                'manager_user_id',
                'membership_status',
                'membership_confirmed_at',
                'membership_confirmed_by_user_id',
            ])
            ->withTimestamps();
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    public function positionTransitions(): HasMany
    {
        return $this->hasMany(PositionTransition::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(OrganizationInvitation::class);
    }
}
