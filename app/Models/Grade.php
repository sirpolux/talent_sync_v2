<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    protected $fillable = [
        'grading_system_id',
        'label',
        'min_value',
        'max_value',
        'description',
        'order',
    ];

    protected $casts = [
        'min_value' => 'decimal:2',
        'max_value' => 'decimal:2',
    ];

    /**
     * Grade belongs to GradingSystem
     */
    public function gradingSystem(): BelongsTo
    {
        return $this->belongsTo(GradingSystem::class);
    }

    /**
     * Check if a score falls within this grade
     */
    public function containsScore($score): bool
    {
        return $score >= $this->min_value && $score <= $this->max_value;
    }
}
