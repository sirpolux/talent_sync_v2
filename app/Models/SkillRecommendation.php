<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SkillRecommendation extends Model
{
    protected $fillable = [
        'organization_id',
        'title',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function recipients(): HasMany
    {
        return $this->hasMany(SkillRecommendationRecipient::class);
    }

    public function recommendedSkills(): HasMany
    {
        return $this->hasMany(SkillRecommendationRecommendedSkill::class);
    }
}