<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkillRecommendationRecipient extends Model
{
    protected $guarded = [];

    protected $casts = [
        'notified_at' => 'datetime',
        'read_at' => 'datetime',
        'registered_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function skillRecommendation(): BelongsTo
    {
        return $this->belongsTo(SkillRecommendation::class);
    }

    public function organizationUser(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class);
    }
}
