<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerCertificationAttachment extends Model
{
    protected $guarded = [];

    public function certification(): BelongsTo
    {
        return $this->belongsTo(TrainerCertification::class, 'trainer_certification_id');
    }
}
