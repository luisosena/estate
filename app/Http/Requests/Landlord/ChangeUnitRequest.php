<?php

namespace App\Http\Requests\Landlord;

use Illuminate\Foundation\Http\FormRequest;

class ChangeUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'landlord';
    }

    public function rules(): array
    {
        return [
            'new_unit_id' => 'required|exists:units,id',
        ];
    }
}
