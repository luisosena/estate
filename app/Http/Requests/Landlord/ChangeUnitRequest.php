<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class ChangeUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === Role::Landlord;
    }

    public function rules(): array
    {
        return [
            'new_unit_id' => 'required|exists:units,id',
        ];
    }
}
