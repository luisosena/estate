<?php

use App\Models\Document;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Services\DocumentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
    $this->property = Property::factory()->create(['owner_id' => $this->landlord->id]);
    $this->unit = Unit::factory()->create(['property_id' => $this->property->id]);
    $this->tenant = Tenant::factory()->create();
    $this->tenancy = Tenancy::factory()->create([
        'tenant_id' => $this->tenant->id,
        'unit_id' => $this->unit->id,
        'status' => 'active',
        'monthly_rent' => 20000,
    ]);
    $this->service = new DocumentService();
    Storage::fake('documents');
});

it('uploads a valid PDF document', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');

    $document = $this->service->upload($file, $this->tenancy, 'tenancy_agreement', $this->landlord);

    expect($document->file_name)->toBe('agreement.pdf')
        ->and($document->category)->toBe('tenancy_agreement')
        ->and($document->user_id)->toBe($this->landlord->id)
        ->and($document->documentable_type)->toBe(Tenancy::class)
        ->and($document->documentable_id)->toBe($this->tenancy->id)
        ->and($document->file_size)->toBe(102400);
});

it('uploads a valid DOCX document', function () {
    $file = UploadedFile::fake()->create('contract.docx', 200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    $document = $this->service->upload($file, $this->tenancy, 'other', $this->landlord);

    expect($document->file_name)->toBe('contract.docx')
        ->and($document->category)->toBe('other');
});

it('rejects file exceeding max size', function () {
    $maxSize = config('documents.max_size', 10485760);
    $file = UploadedFile::fake()->create('large.pdf', $maxSize + 1, 'application/pdf');

    expect(fn () => $this->service->upload($file, $this->tenancy, 'tenancy_agreement'))
        ->toThrow(\Illuminate\Validation\ValidationException::class);
});

it('rejects disallowed file type', function () {
    $file = UploadedFile::fake()->create('image.jpg', 100, 'image/jpeg');

    expect(fn () => $this->service->upload($file, $this->tenancy, 'inspection_photo'))
        ->toThrow(\Illuminate\Validation\ValidationException::class);
});

it('lists documents for a documentable model', function () {
    $file1 = UploadedFile::fake()->create('doc1.pdf', 100, 'application/pdf');
    $file2 = UploadedFile::fake()->create('doc2.pdf', 150, 'application/pdf');

    $this->service->upload($file1, $this->tenancy, 'tenancy_agreement', $this->landlord);
    $this->service->upload($file2, $this->tenancy, 'other', $this->landlord);

    $documents = $this->service->listFor($this->tenancy);

    expect($documents)->toHaveCount(2)
        ->and($documents->first()->file_name)->toBe('doc2.pdf');
});

it('returns empty collection when no documents exist', function () {
    $documents = $this->service->listFor($this->tenancy);

    expect($documents)->toHaveCount(0);
});

it('downloads an existing document', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');
    $document = $this->service->upload($file, $this->tenancy, 'tenancy_agreement', $this->landlord);

    $response = $this->service->download($document);

    expect($response->getStatusCode())->toBe(200);
});

it('aborts when downloading non-existent document', function () {
    $document = Document::create([
        'user_id' => $this->landlord->id,
        'documentable_type' => 'tenancies',
        'documentable_id' => $this->tenancy->id,
        'file_path' => 'nonexistent.pdf',
        'file_name' => 'missing.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    expect(fn () => $this->service->download($document))->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

it('deletes a document and its file', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');
    $document = $this->service->upload($file, $this->tenancy, 'tenancy_agreement', $this->landlord);

    $this->service->delete($document);

    expect(Document::find($document->id))->toBeNull()
        ->and(Storage::disk('documents')->exists($document->file_path))->toBeFalse();
});

it('handles deletion of document with missing file gracefully', function () {
    $document = Document::create([
        'user_id' => $this->landlord->id,
        'documentable_type' => 'tenancies',
        'documentable_id' => $this->tenancy->id,
        'file_path' => 'already-deleted.pdf',
        'file_name' => 'test.pdf',
        'file_type' => 'application/pdf',
        'file_size' => 100,
        'category' => 'tenancy_agreement',
        'uploaded_at' => now(),
    ]);

    $this->service->delete($document);

    expect(Document::find($document->id))->toBeNull();
});

it('stores file path with category and model structure', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');

    $document = $this->service->upload($file, $this->tenancy, 'tenancy_agreement', $this->landlord);

    expect($document->file_path)->toContain('tenancy_agreement')
        ->and($document->file_path)->toContain('Tenancy')
        ->and($document->file_path)->toContain((string) $this->tenancy->id);
});

it('works without uploader', function () {
    $file = UploadedFile::fake()->create('agreement.pdf', 100, 'application/pdf');

    $document = $this->service->upload($file, $this->tenancy, 'tenancy_agreement');

    expect($document->user_id)->toBeNull();
});
