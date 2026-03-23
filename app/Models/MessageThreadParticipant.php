<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageThreadParticipant extends Model
{
    protected $guarded = [];

    public function messageThread(): BelongsTo
    {
        return $this->belongsTo(MessageThread::class);
    }

    public function organizationUser(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class);
    }
}