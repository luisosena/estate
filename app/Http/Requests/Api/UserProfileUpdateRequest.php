<?php

namespace App\Http\Requests\Api;

use App\Concerns\PhoneValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class UserProfileUpdateRequest extends FormRequest
{
    use PhoneValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$this->user()->id],
            'phone' => $this->phoneRules(false),
        ];
    }
}
