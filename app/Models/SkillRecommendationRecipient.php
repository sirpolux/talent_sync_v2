<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkillRecommendationRecipient extends Model
{
    protected $fillable = [
        'organization_id',
        'skill_recommendation_id',
        'user_id',
        'employee_id',
        'employee_career_path_selection_id',
        'status',
    ];

    public function skillRecommendation(): BelongsTo
    {
        return $this->belongsTo(SkillRecommendation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}