<?php

namespace App\Http\Requests\Api\Landlord;

use Illuminate\Foundation\Http\FormRequest;

class PropertyStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'property_type' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ];
    }
}
