<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Models\Tenancy;
use App\Services\DocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $documentService)
    {
    }

    public function store(StoreDocumentRequest $request, Tenancy $tenancy): RedirectResponse
    {
        $this->authorize('upload', [Document::class, $tenancy]);

        $file = $request->file('document');
        $category = $request->input('category', 'tenancy_agreement');

        $this->documentService->upload($file, $tenancy, $category, $request->user());

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    public function download(Request $request, Document $document)
    {
        $this->authorize('download', $document);

        return $this->documentService->download($document);
    }

    public function destroy(Request $request, Document $document): RedirectResponse
    {
        $this->authorize('delete', $document);

        $this->documentService->delete($document);

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }
}
