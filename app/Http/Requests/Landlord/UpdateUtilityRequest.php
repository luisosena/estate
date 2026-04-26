<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUtilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === Role::Landlord;
    }

    public function rules(): array
    {
        return [
            'amount' => 'sometimes|numeric|min:0',
            'billing_cycle' => ['sometimes', Rule::in(['monthly', 'quarterly', 'annual'])],
            'provider' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'meter_number' => 'nullable|string|max:100',
            'status' => ['sometimes', Rule::in(['active', 'suspended', 'disconnected'])],
            'notes' => 'nullable|string',
        ];
    }
}
