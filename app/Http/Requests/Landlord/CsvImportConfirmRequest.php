<?php

namespace App\Http\Requests\Landlord;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;

class CsvImportConfirmRequest extends FormRequest
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
            'preview_token' => ['required', 'string', 'uuid'],
            'original_filename' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'preview_token.required' => 'Preview session expired. Please re-upload your file.',
            'preview_token.uuid' => 'Invalid preview token.',
        ];
    }

    /**
     * Resolve the stored file path from the preview token.
     */
    public function storedPath(): string
    {
        return 'csv-imports/preview/'.$this->input('preview_token').'.csv';
    }

    /**
     * Confirm the preview file actually exists in storage.
     */
    public function previewFileExists(): bool
    {
        return Storage::exists($this->storedPath());
    }
}
