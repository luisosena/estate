<?php

namespace App\Http\Requests\Api\Landlord;

use Illuminate\Foundation\Http\FormRequest;

class UnitStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'unit_code' => 'required|string|max:50|unique:units',
            'unit_name' => 'required|string|max:100',
        ];
    }
}
