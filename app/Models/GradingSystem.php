<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradingSystem extends Model
{
    protected $fillable = [
        'organization_id',
        'name',
        'description',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * GradingSystem belongs to Organization (nullable for system-wide defaults)
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * GradingSystem has many Grades
     */
    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class)->orderBy('order');
    }

    /**
     * GradingSystem can be used by many positions
     */
    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    /**
     * Get grade for a given score
     */
    public function getGradeForScore($score): ?Grade
    {
        return $this->grades()->where('min_value', '<=', $score)
            ->where('max_value', '>=', $score)
            ->first();
    }

    /**
     * Get passing grade (highest grade)
     */
    public function getPassingGrade(): ?Grade
    {
        return $this->grades()->orderByDesc('min_value')->first();
    }

    /**
     * Check if a score is passing
     */
    public function isPassingScore($score): bool
    {
        $passingGrade = $this->getPassingGrade();
        if (!$passingGrade) return false;
        return $score >= $passingGrade->min_value;
    }
}
