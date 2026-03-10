<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    protected $fillable = [
        'organization_id',
        'name',
        'description',
    ];

    /**
     * Skill belongs to Organization
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Skill can be required by many positions
     */
    public function positions(): BelongsToMany
    {
        return $this->belongsToMany(Position::class, 'position_skills')
            ->withPivot(['required_proficiency', 'is_required', 'minimum_score'])
            ->withTimestamps();
    }
}
