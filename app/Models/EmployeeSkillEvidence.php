<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSkillEvidence extends Model
{
    protected $table = 'employee_skill_evidences';
    protected $fillable = [
        'employee_skill_allocation_id',
        'document_url',
        'uploaded_by',
        'uploaded_at',
        'verification_status',
        'verified_by',
        'verified_at',
        'verification_note',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(EmployeeSkillAllocation::class, 'employee_skill_allocation_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
