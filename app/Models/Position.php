<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Position extends Model
{
    protected $fillable = [
        'organization_id',
        'department_id',
        'name',
        'slug',
        'min_months_in_role',
        'responsibilities',
        'level',
        'role_id',
        'duration_before_promotion',
        'duration_before_promotion_type',
        'reports_to',
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
                'category',
                'department_id',
                'role_started_at',
                'manager_user_id',
            ])
            ->withTimestamps();
    }
}
