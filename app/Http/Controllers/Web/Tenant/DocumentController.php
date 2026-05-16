<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Tenancy;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $documentService)
    {
    }

    public function index(Request $request, Tenancy $tenancy): Response
    {
        $this->authorize('view', $tenancy);

        $documents = $this->documentService->listFor($tenancy);

        return Inertia::render('tenant/documents/index', [
            'tenancy' => $tenancy->load(['unit.property']),
            'documents' => $documents,
        ]);
    }

    public function download(Request $request, Document $document)
    {
        $this->authorize('download', $document);

        return $this->documentService->download($document);
    }
}
