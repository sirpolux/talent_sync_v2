<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SkillRecommendation extends Model
{
    protected $guarded = [];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }

    public function recommendedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recommended_by_user_id');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(SkillRecommendationRecipient::class);
    }

     public function recommendationRecipients(): HasMany
    {
        return $this->hasMany(SkillRecommendationRecipient::class);
    }

}
