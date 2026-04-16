<?php

namespace App\Http\Requests\Landlord;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'landlord';
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'payment_type' => ['required', Rule::in(['rent', 'utility'])],
            'payment_method' => 'required|string|max:255',
            'status' => ['required', Rule::in(['paid', 'partial', 'overdue', 'pending'])],
            'paid_at' => 'required|date',
            'rent_bill_id' => 'nullable|exists:rent_bills,id',
            'utility_bill_id' => 'nullable|exists:utility_bills,id',
        ];
    }
}
