<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTenantWithTenancyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user() && auth()->user()->role === 'landlord';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Tenant Information
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255|unique:tenants,email',
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_phone' => 'required|string|max:20',
            'emergency_contact_relation' => 'required|string|max:100',

            // Unit Assignment
            'unit_id' => 'required|exists:units,id',
            
            // Tenancy Information
            'move_in_date' => 'required|date|after_or_equal:today',
            'monthly_rent' => 'required|numeric|min:0',
            'security_deposit' => 'nullable|numeric|min:0',
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
            'unit_id.required' => 'Please select a unit for the tenant.',
            'unit_id.exists' => 'The selected unit is invalid.',
            'move_in_date.after_or_equal' => 'Move-in date cannot be in the past.',
            'monthly_rent.min' => 'Monthly rent must be a positive number.',
            'security_deposit.min' => 'Security deposit must be a positive number.',
            'tenancy_agreement.mimes' => 'Tenancy agreement must be a PDF or Word document.',
            'tenancy_agreement.max' => 'Tenancy agreement file size cannot exceed 10MB.',
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

            // Check if unit belongs to landlord
            $unit = \App\Models\Unit::find($unitId);
            if (!$unit || $unit->property->owner_id !== $landlord->id) {
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
