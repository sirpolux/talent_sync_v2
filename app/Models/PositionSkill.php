<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PositionSkill extends Model
{
    protected $table = 'position_skills';

    protected $fillable = [
        'position_id',
        'skill_id',
        'required_proficiency',
        'is_required',
        'minimum_score',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'minimum_score' => 'decimal:2',
    ];

    /**
     * PositionSkill belongs to Position
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * PositionSkill belongs to Skill
     */
    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
