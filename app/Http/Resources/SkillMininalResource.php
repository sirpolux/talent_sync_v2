<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkillMininalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'name' => $this->name,
            'type' => $this->type,
            'category' => $this->category,
            'applies_to_all_departments' => (bool) $this->applies_to_all_departments,
            'department_id' => $this->department_id,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
