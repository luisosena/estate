<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\Tenancy;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $documentService) {}

    public function store(StoreDocumentRequest $request, Tenancy $tenancy): JsonResponse
    {
        $this->authorize('upload', [Document::class, $tenancy]);

        $file = $request->file('document');
        $category = $request->input('category', 'tenancy_agreement');

        $document = $this->documentService->upload($file, $tenancy, $category, $request->user());

        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => new DocumentResource($document),
        ], 201);
    }

    public function index(Request $request, Tenancy $tenancy): JsonResponse
    {
        $this->authorize('viewAny', [Document::class, $tenancy]);

        $documents = $this->documentService->listFor($tenancy);

        return response()->json([
            'data' => DocumentResource::collection($documents),
        ]);
    }

    public function download(Request $request, Document $document)
    {
        $this->authorize('download', $document);

        return $this->documentService->download($document);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        $this->authorize('delete', $document);

        $this->documentService->delete($document);

        return response()->json(['message' => 'Document deleted successfully']);
    }
}
