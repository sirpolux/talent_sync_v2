<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainerCertification extends Model
{
    protected $guarded = [];

    protected $casts = [
        'issued_at' => 'date',
        'expires_at' => 'date',
    ];

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(TrainerSpecialty::class, 'trainer_specialty_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(TrainerProfile::class, 'trainer_profile_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TrainerCertificationAttachment::class, 'trainer_certification_id');
    }
}