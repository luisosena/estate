<?php

namespace App\Http\Requests\Api\Landlord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UtilityBillUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount_due' => 'sometimes|numeric|min:0',
            'units_consumed' => 'nullable|numeric|min:0',
            'due_date' => 'sometimes|date',
            'status' => ['sometimes', Rule::in(['pending', 'paid', 'partial', 'overdue', 'waived'])],
            'notes' => 'nullable|string',
        ];
    }
}
