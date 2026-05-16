<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentService
{
    protected int $maxSize;
    protected array $allowedMimes;

    public function __construct()
    {
        $this->maxSize = config('documents.max_size', 10485760);
        $this->allowedMimes = array_map('trim', explode(',', config('documents.allowed_mimes', 'pdf,doc,docx')));
    }

    public function upload(UploadedFile $file, Model $documentable, string $category, ?\App\Models\User $uploader = null): Document
    {
        $this->validateFile($file);

        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $uuid = Str::uuid()->toString();
        $relativePath = sprintf(
            '%s/%s/%s/%s.%s',
            $category,
            class_basename($documentable),
            $documentable->id,
            $uuid,
            $extension
        );

        $path = $file->storeAs('', $relativePath, 'documents');

        return Document::create([
            'user_id' => $uploader?->id,
            'documentable_type' => $documentable->getMorphClass(),
            'documentable_id' => $documentable->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'category' => $category,
            'uploaded_at' => now(),
        ]);
    }

    public function download(Document $document): StreamedResponse
    {
        if (! Storage::disk('documents')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('documents')->download($document->file_path, $document->file_name);
    }

    public function listFor(Model $documentable): \Illuminate\Support\Collection
    {
        return Document::where('documentable_type', $documentable->getMorphClass())
            ->where('documentable_id', $documentable->id)
            ->orderByDesc('uploaded_at')
            ->get();
    }

    public function delete(Document $document): void
    {
        if (Storage::disk('documents')->exists($document->file_path)) {
            Storage::disk('documents')->delete($document->file_path);
        }

        $document->delete();
    }

    protected function validateFile(UploadedFile $file): void
    {
        if ($file->getSize() > $this->maxSize) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], ['document' => 'The file size exceeds the maximum allowed size.'])
            );
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: '');
        if (! in_array($extension, $this->allowedMimes, true)) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], ['document' => 'The file type is not allowed. Allowed types: '.implode(', ', $this->allowedMimes).'.'])
            );
        }
    }
}
