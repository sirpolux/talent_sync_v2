<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerCertification extends Model
{
    protected $guarded = [];

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(TrainerSpecialty::class, 'trainer_specialty_id');
    }
}
