<?php

namespace App\Http\Requests\Api\Landlord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenancyUtilityStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'utility_type_id' => ['required', 'exists:utility_types,id'],
            'amount' => 'required|numeric|min:0',
            'billing_cycle' => ['required', Rule::in(['monthly', 'quarterly', 'annual'])],
            'provider' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'meter_number' => 'nullable|string|max:100',
        ];
    }
}
