<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'category' => 'required|in:tenancy_agreement,receipt,inspection_photo,id_document,other',
        ];
    }

    public function messages(): array
    {
        return [
            'document.required' => 'A document file is required.',
            'document.file' => 'The uploaded file is invalid.',
            'document.mimes' => 'The document must be a file of type: pdf, doc, docx.',
            'document.max' => 'The document size must not exceed 10MB.',
            'category.required' => 'A document category is required.',
            'category.in' => 'The category must be one of: tenancy_agreement, receipt, inspection_photo, id_document, other.',
        ];
    }
}
