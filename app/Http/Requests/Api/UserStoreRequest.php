<?php

namespace App\Http\Requests\Api;

use App\Concerns\PhoneValidationRules;
use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
{
    use PhoneValidationRules;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => $this->phoneRules(false),
        ];

        if ($this->user() && $this->user()->role === Role::Landlord) {
            $rules['role'] = ['required', Rule::in(['tenant'])];
        } else {
            $rules['role'] = ['required', Rule::in(['tenant', 'landlord', 'admin'])];
        }

        return $rules;
    }
}
