<?php

namespace App\Http\Requests\Landlord;

use App\Concerns\PhoneValidationRules;
use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTenantRequest extends FormRequest
{
    use PhoneValidationRules;

    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === Role::Landlord;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => $this->phoneRules(),
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => $this->phoneRules(false),
            'emergency_contact_relation' => 'nullable|string|max:100',
        ];
    }
}
