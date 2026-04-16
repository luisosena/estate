<?php

namespace App\Http\Requests\Landlord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUtilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'landlord';
    }

    public function rules(): array
    {
        $tenancy = $this->route('tenancy');
        
        return [
            'utility_type_id' => [
                'required',
                'exists:utility_types,id',
                Rule::unique('tenancy_utilities')->where('tenancy_id', $tenancy->id),
            ],
            'amount' => 'required|numeric|min:0',
            'billing_cycle' => ['required', Rule::in(['monthly', 'quarterly', 'annual'])],
            'provider' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'meter_number' => 'nullable|string|max:100',
            'status' => ['required', Rule::in(['active', 'suspended', 'disconnected'])],
            'notes' => 'nullable|string',
        ];
    }
}
