<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingProgress extends Model
{
    protected $guarded = [];

    public function trainingSession(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class, 'participant_organization_user_id');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class, 'updater_organization_user_id');
    }
}