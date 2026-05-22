<?php

namespace App\Http\Requests\Api\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class PaymentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:1|max:100000000',
            'payment_type' => 'required|in:rent,utility',
            'payment_method' => 'required|in:mobile_money,bank_transfer',
            'utility_bill_id' => 'required_if:payment_type,utility|nullable|exists:utility_bills,id',
            'rent_bill_id' => 'nullable|exists:rent_bills,id',
        ];
    }
}
