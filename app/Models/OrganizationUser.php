<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationUser extends Model
{
    protected $table = 'organization_user';

    protected $fillable = [
        'organization_id',
        'user_id',
        'is_org_admin',
        'is_sub_admin',
        'is_employee',
        'is_trainer',
        'can_manage_courses',
        'can_manage_reporting',
        'employee_code',
        'phone',
        'employment_type',
        'department_id',
        'position_id',
        'date_started_current_position',
        'manager_user_id',
        'gender',
        'nationality',
        'state',
        'work_mode',
        'employment_date',
        'onboarding_stage',
    ];

    protected $casts = [
        'is_org_admin' => 'boolean',
        'is_sub_admin' => 'boolean',
        'is_employee' => 'boolean',
        'is_trainer' => 'boolean',
        'can_manage_courses' => 'boolean',
        'can_manage_reporting' => 'boolean',
        'employment_date' => 'date',
        'date_started_current_position' => 'date',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function skillAllocations(): HasMany
    {
        return $this->hasMany(EmployeeSkillAllocation::class, 'organization_user_id');
    }

    public function careerPathSelections(): HasMany
    {
        return $this->hasMany(EmployeeCareerPathSelection::class, 'organization_user_id');
    }
}
