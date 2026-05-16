<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $documentService)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== Role::Tenant) {
            abort(403, 'Access denied.');
        }

        $tenancy = $user->tenant?->tenancies()
            ->with(['unit.property'])
            ->where('status', 'active')
            ->first();

        if (! $tenancy) {
            return Inertia::render('tenant/documents/index', [
                'tenancy' => null,
                'documents' => [],
            ]);
        }

        $this->authorize('view', $tenancy);

        $documents = $this->documentService->listFor($tenancy);

        return Inertia::render('tenant/documents/index', [
            'tenancy' => $tenancy,
            'documents' => $documents,
        ]);
    }

    public function download(Request $request, Document $document)
    {
        $this->authorize('download', $document);

        return $this->documentService->download($document);
    }
}
