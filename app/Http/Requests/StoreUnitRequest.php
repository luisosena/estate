<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        $landlord = $this->user();
        $propertyId = $this->input('property_id');
        
        if (!$propertyId) {
            return false;
        }

        return \App\Models\Property::where('owner_id', $landlord->id)
            ->where('id', $propertyId)
            ->exists();
    }

    public function rules(): array
    {
        return [
            'property_id' => [
                'required',
                'integer',
                'exists:properties,id',
            ],
            'unit_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('units', 'unit_code'),
            ],
            'unit_name' => [
                'required',
                'string',
                'max:255',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Please select a property.',
            'property_id.exists' => 'The selected property does not exist.',
            'unit_code.required' => 'Unit code is required.',
            'unit_code.unique' => 'This unit code is already in use. Please choose a different one.',
            'unit_code.max' => 'Unit code must not exceed 50 characters.',
            'unit_name.required' => 'Unit name is required.',
            'unit_name.max' => 'Unit name must not exceed 255 characters.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'unit_code' => trim($this->unit_code),
            'unit_name' => trim($this->unit_name),
        ]);
    }
}
