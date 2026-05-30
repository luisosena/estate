<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;

class CsvImportUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === Role::Landlord;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'csv_file.required' => 'Please select a CSV file to upload.',
            'csv_file.mimes' => 'The file must be a CSV file (.csv).',
            'csv_file.max' => 'The CSV file must not exceed 5 MB.',
        ];
    }
}
