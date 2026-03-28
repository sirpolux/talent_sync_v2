<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Organization;
use App\Models\LeaveRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class)
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

    /**
     * Why this exists:
     * We need a single, consistent way to answer: "what can this logged-in user do in the CURRENT org?"
     * That’s what powers Employee vs Trainer vs Admin UX and authorization.
     */
    public function currentOrganizationMembership(): ?\Illuminate\Database\Eloquent\Relations\Pivot
    {
        $orgId = session('current_organization_id');

        if (!$orgId) {
            return null;
        }

        $org = $this->organizations->firstWhere('id', $orgId);

        return $org?->pivot;
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
