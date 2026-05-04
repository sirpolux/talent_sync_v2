<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSessionParticipantLog extends Model
{
    protected $fillable = [
        'training_session_participant_id',
        'action',
        'old_status',
        'new_status',
        'performed_by',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function participant(): BelongsTo
    {
        return $this->belongsTo(TrainingSessionParticipant::class, 'training_session_participant_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
