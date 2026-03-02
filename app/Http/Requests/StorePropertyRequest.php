<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        
        // Only admins can create properties
        return $user && $user->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'owner_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'property_type' => 'required|in:apartment,house,commercial,mixed',
            'total_units' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive,maintenance',
            'description' => 'nullable|string',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string|max:100',
            'policies' => 'nullable|array',
            'policies.*' => 'string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'owner_id.required' => 'Please select a landlord.',
            'owner_id.exists' => 'The selected landlord does not exist.',
            'name.required' => 'Property name is required.',
            'name.max' => 'Property name must not exceed 255 characters.',
            'address.required' => 'Address is required.',
            'address.max' => 'Address must not exceed 255 characters.',
            'city.required' => 'City is required.',
            'city.max' => 'City must not exceed 100 characters.',
            'state.required' => 'State is required.',
            'state.max' => 'State must not exceed 100 characters.',
            'postal_code.required' => 'Postal code is required.',
            'postal_code.max' => 'Postal code must not exceed 20 characters.',
            'country.required' => 'Country is required.',
            'country.max' => 'Country must not exceed 100 characters.',
            'property_type.required' => 'Property type is required.',
            'property_type.in' => 'Invalid property type selected.',
            'total_units.required' => 'Total units is required.',
            'total_units.integer' => 'Total units must be a number.',
            'total_units.min' => 'Total units must be at least 1.',
            'status.required' => 'Status is required.',
            'status.in' => 'Invalid status selected.',
            'amenities.array' => 'Amenities must be an array.',
            'amenities.*.string' => 'Each amenity must be text.',
            'amenities.*.max' => 'Each amenity must not exceed 100 characters.',
            'policies.array' => 'Policies must be an array.',
            'policies.*.string' => 'Each policy must be text.',
            'policies.*.max' => 'Each policy must not exceed 255 characters.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Filter out empty amenities and policies
        $amenities = $this->amenities ? array_filter($this->amenities, function ($amenity) {
            return !empty(trim($amenity));
        }) : [];

        $policies = $this->policies ? array_filter($this->policies, function ($policy) {
            return !empty(trim($policy));
        }) : [];

        $this->merge([
            'name' => trim($this->name),
            'address' => trim($this->address),
            'city' => trim($this->city),
            'state' => trim($this->state),
            'postal_code' => trim($this->postal_code),
            'country' => trim($this->country),
            'amenities' => array_values($amenities),
            'policies' => array_values($policies),
        ]);
    }
}
