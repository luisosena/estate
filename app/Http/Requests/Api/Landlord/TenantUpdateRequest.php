<?php

namespace App\Http\Requests\Api\Landlord;

use App\Concerns\PhoneValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class TenantUpdateRequest extends FormRequest
{
    use PhoneValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'sometimes|string|max:255',
            'phone' => $this->phoneRules(false),
            'email' => 'sometimes|email|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => $this->phoneRules(false),
        ];
    }
}
