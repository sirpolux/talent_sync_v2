<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionRequest extends FormRequest
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
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'min_months_in_role' => ['nullable', 'integer', 'min:0'],
            'responsibilities' => ['nullable', 'string'],
            'level' => ['nullable', 'string', 'in:entry,intermediate,senior,lead,manager,director'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'duration_before_promotion' => ['nullable', 'integer', 'min:1'],
            'duration_before_promotion_type' => ['nullable', 'string', 'in:days,weeks,months,years'],
            'reports_to' => ['nullable', 'integer', 'exists:positions,id'],
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
            'reports_to.exists' => 'The selected reporting position does not exist.',
        ];
    }
}
