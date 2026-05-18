<?php

namespace App\Http\Requests;

use App\Enums\Role;
use App\Models\Unit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTenantWithTenancyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user() && auth()->user()->role === Role::Landlord;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Tenant Information
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255|unique:tenants,email|unique:users,email',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'emergency_contact_relation' => 'nullable|string|max:100',

            // Unit Assignment (Optional)
            'unit_id' => 'nullable|exists:units,id',

            // Tenancy Information (Required if unit_id is present)
            'move_in_date' => 'required_with:unit_id|nullable|date',
            'monthly_rent' => 'required_with:unit_id|nullable|numeric|min:0',
            'security_deposit' => 'required_with:unit_id|nullable|numeric|min:0',
            'rent_due_day' => 'nullable|integer|min:1|max:28',
            'tenancy_agreement' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'unit_id.exists' => 'The selected unit is invalid.',
            'email.required' => 'Email address is required for user account creation.',
            'email.unique' => 'This email address is already in use.',
            'monthly_rent.required_with' => 'Monthly rent is required when assigning a unit.',
            'move_in_date.required_with' => 'Move-in date is required when assigning a unit.',
        ];
    }

    /**
     * Configure the validator to ensure the unit belongs to the landlord and is available.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $landlord = auth()->user();
            $unitId = $this->input('unit_id');

            if (! $unitId) {
                return;
            }

            // Check if unit belongs to landlord
            $unit = Unit::find($unitId);
            if (! $unit || $unit->property->owner_id !== $landlord->id) {
                $validator->errors()->add('unit_id', 'You do not have access to this unit.');

                return;
            }

            // Check if unit is available (no active tenancies)
            $hasActiveTenancy = $unit->tenancies()
                ->where('status', 'active')
                ->exists();

            if ($hasActiveTenancy) {
                $validator->errors()->add('unit_id', 'This unit is not available. It already has an active tenancy.');
            }
        });
    }
}
