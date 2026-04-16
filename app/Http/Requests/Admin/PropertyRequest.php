<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
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
}
