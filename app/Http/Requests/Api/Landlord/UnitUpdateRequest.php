<?php

namespace App\Http\Requests\Api\Landlord;

use Illuminate\Foundation\Http\FormRequest;

class UnitUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_code' => 'sometimes|string|max:50',
            'unit_name' => 'sometimes|string|max:100',
            'status' => 'sometimes|in:available,occupied,maintenance',
        ];
    }
}
