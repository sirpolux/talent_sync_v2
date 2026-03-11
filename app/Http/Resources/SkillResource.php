<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkillResource extends JsonResource
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
            'description' => $this->description,
            'type' => $this->type,
            'category' => $this->category,
            'applies_to_all_departments' => (bool) $this->applies_to_all_departments,
            'department_id' => $this->department_id,
            'department' => $this->whenLoaded('department', fn () => new DepartmentMinimalResource($this->department)),
            'added_by' => $this->added_by,
            'added_by_user' => $this->whenLoaded('addedBy', fn () => [
                'id' => $this->addedBy?->id,
                'name' => $this->addedBy?->name,
                'email' => $this->addedBy?->email,
            ]),
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
