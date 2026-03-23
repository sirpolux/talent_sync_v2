<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentUpload extends Model
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

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class, 'uploader_organization_user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class, 'reviewer_organization_user_id');
    }
}