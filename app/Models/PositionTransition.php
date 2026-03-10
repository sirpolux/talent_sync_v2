<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PositionTransition extends Model
{
    protected $fillable = [
        'organization_id',
        'from_position_id',
        'to_position_id',
        'track',
    ];

    /**
     * PositionTransition belongs to Organization
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * PositionTransition belongs to from Position
     */
    public function fromPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'from_position_id');
    }

    /**
     * PositionTransition belongs to to Position
     */
    public function toPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'to_position_id');
    }
}
