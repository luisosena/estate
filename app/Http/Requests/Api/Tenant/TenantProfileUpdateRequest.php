<?php

namespace App\Http\Requests\Api\Tenant;

use App\Concerns\PhoneValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class TenantProfileUpdateRequest extends FormRequest
{
    use PhoneValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => $this->phoneRules(false),
            'email' => ['sometimes', 'email'],
            'emergency_contact_name' => ['sometimes', 'string', 'max:255'],
            'emergency_contact_phone' => $this->phoneRules(false),
            'emergency_contact_relation' => ['sometimes', 'string', 'max:100'],
        ];
    }
}
