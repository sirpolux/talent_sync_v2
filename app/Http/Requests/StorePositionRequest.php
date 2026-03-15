<?php

namespace App\Http\Requests;

use App\Models\Position;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePositionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled at controller/middleware level with org.admin middleware
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $orgId = (int) $this->session()->get('current_organization_id');
        $departmentId = $this->input('department_id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'min_months_in_role' => ['nullable', 'integer', 'min:0'],
            'responsibilities' => ['nullable', 'string'],
            'level' => [
                // 'nullable',
                'string',
                Rule::in(['entry', 'intermediate', 'senior', 'lead', 'manager', 'director']),
                function ($attribute, $value, $fail) use ($departmentId) {
                    // If no department is selected, we treat this as an org-wide leadership role
                    // and only allow manager/director levels.
                    if (empty($departmentId) && !in_array($value, ['manager', 'director'], true)) {
                        $fail('When department is not selected, level must be Manager or Director.');
                    }
                },
            ],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'duration_before_promotion' => ['nullable', 'integer', 'min:1'],
            'duration_before_promotion_type' => ['nullable', 'string', 'in:days,weeks,months,years'],

            // Reporting line (FK to positions.id). Must be org-valid and satisfy business rule.
            'reports_to_position_id' => [
                'nullable',
                'integer',
                'exists:positions,id',
                function ($attribute, $value, $fail) use ($orgId, $departmentId) {
                    if (empty($value)) {
                        return;
                    }

                    $candidate = Position::query()
                        ->where('organization_id', $orgId)
                        ->whereKey($value)
                        ->first();

                    if (!$candidate) {
                        $fail('The selected reporting position does not exist in this organization.');
                        return;
                    }

                    // If department is not selected, only Manager/Director can be selected as reports-to.
                    if (empty($departmentId) && !in_array($candidate->level, ['manager', 'director'], true)) {
                        $fail('When department is not selected, you can only report to a Manager or Director.');
                        return;
                    }

                    // If department is selected, allow same department OR management levels across org.
                    if (!empty($departmentId)) {
                        $allowedManagement = ['senior', 'lead', 'manager', 'director'];

                        $sameDepartment = (int) $candidate->department_id === (int) $departmentId;
                        $isManagement = in_array($candidate->level, $allowedManagement, true);

                        if (!$sameDepartment && !$isManagement) {
                            $fail('You can only report to a position in the same department or a management-level position (Senior/Lead/Manager/Director).');
                        }
                    }
                },
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Position name is required.',
            'name.max' => 'Position name cannot exceed 255 characters.',
            'department_id.exists' => 'The selected department does not exist.',
            'min_months_in_role.integer' => 'Minimum months in role must be a number.',
            'min_months_in_role.min' => 'Minimum months in role cannot be negative.',
            'level.in' => 'The selected level is invalid.',
            'role_id.exists' => 'The selected role does not exist.',
            'duration_before_promotion.min' => 'Duration must be at least 1.',
            'duration_before_promotion_type.in' => 'Invalid duration type.',
            'reports_to_position_id.exists' => 'The selected reporting position does not exist.',
        ];
    }
}
