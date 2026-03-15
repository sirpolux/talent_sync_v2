<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCareerPathRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_id' => ['nullable', 'integer'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],

            // Steps are optional at create time
            'steps' => ['sometimes', 'array'],
            'steps.*.from_position_id' => ['required_with:steps', 'integer'],
            'steps.*.to_position_id' => ['required_with:steps', 'integer'],
            'steps.*.track' => ['nullable', 'string', 'max:255'],
            'steps.*.order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
