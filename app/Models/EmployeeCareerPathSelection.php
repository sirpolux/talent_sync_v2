<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeCareerPathSelection extends Model
{
    protected $fillable = [
        'organization_id',
        'organization_user_id',
        'career_path_id',
        'is_active',
        'selected_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'selected_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function organizationUser(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class, 'organization_user_id');
    }

    public function careerPath(): BelongsTo
    {
        return $this->belongsTo(CareerPath::class);
    }
}