<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class RecordPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === Role::Landlord;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:1',
            'payment_method' => ['required', Rule::in(['mobile_money', 'bank_transfer'])],
            'rent_bill_ids' => 'nullable|array',
            'rent_bill_ids.*' => 'integer|exists:rent_bills,id',
            'billing_months' => 'nullable|array',
            'billing_months.*' => 'date_format:Y-m',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Ensure at least one of rent_bill_ids or billing_months is provided.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if (
                empty($this->input('rent_bill_ids'))
                && empty($this->input('billing_months'))
            ) {
                $validator->errors()->add(
                    'rent_bill_ids',
                    'Please select at least one bill or add a billing month.'
                );
            }
        });
    }
}
