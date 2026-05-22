<?php

namespace App\Http\Requests\Api\Landlord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'sometimes|numeric|min:0',
            'payment_type' => ['sometimes', Rule::in(['rent', 'utility'])],
            'payment_method' => 'sometimes|string|max:255',
            'status' => ['sometimes', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'sometimes|date',
        ];
    }
}
