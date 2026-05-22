<?php

namespace App\Http\Requests\Api\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class TenantProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'email' => ['sometimes', 'email'],
            'emergency_contact_name' => ['sometimes', 'string', 'max:255'],
            'emergency_contact_phone' => ['sometimes', 'string', 'max:20'],
            'emergency_contact_relation' => ['sometimes', 'string', 'max:100'],
        ];
    }
}
