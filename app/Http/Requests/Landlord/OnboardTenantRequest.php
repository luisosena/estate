<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class OnboardTenantRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            // Property/Unit context
            'property_id' => 'required|exists:properties,id',
            'unit_id' => 'required|exists:units,id',

            // Tenant personal details
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',

            // Onboarding details
            'move_in_date' => 'required|date',
            'monthly_rent' => 'required|numeric|min:0',
            'security_deposit' => 'nullable|numeric|min:0',

            // Emergency contact (Merged from legacy StoreTenantRequest)
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_phone' => 'required|string|max:20',
            'emergency_contact_relation' => 'required|string|max:100',

            // Tenancy Agreement (Optional)
            'tenancy_agreement' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'property_id.required' => 'Please select a property.',
            'unit_id.required' => 'Please select a unit.',
            'move_in_date.required' => 'Please specify the move-in date.',
            'monthly_rent.required' => 'Monthly rent amount is required.',
            'emergency_contact_name.required' => 'Emergency contact name is required.',
            'emergency_contact_phone.required' => 'Emergency contact phone is required.',
            'emergency_contact_relation.required' => 'Emergency contact relation is required.',
        ];
    }
}
