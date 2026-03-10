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
        'grade_scale',
        'passing_grade',
    ];

    protected $casts = [
        'grade_scale' => 'array', // JSON field for grade scale
    ];

    /**
     * GradingSystem belongs to Organization
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * GradingSystem can be used by many positions
     */
    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    /**
     * Get the passing score for this grading system
     */
    public function getPassingScore(): ?float
    {
        $scale = $this->grade_scale;
        return isset($scale[$this->passing_grade]) ? (float) $scale[$this->passing_grade] : null;
    }

    /**
     * Get grade letter for a given score
     */
    public function getGradeForScore(float $score): ?string
    {
        $scale = $this->grade_scale;
        arsort($scale); // Sort by score descending

        foreach ($scale as $grade => $minScore) {
            if ($score >= $minScore) {
                return $grade;
            }
        }

        return null;
    }

    /**
     * Check if a score passes this grading system
     */
    public function isPassingScore(float $score): bool
    {
        $passingScore = $this->getPassingScore();
        return $passingScore !== null && $score >= $passingScore;
    }
}
