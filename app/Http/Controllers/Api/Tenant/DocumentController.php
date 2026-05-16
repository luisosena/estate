<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\Tenancy;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $documentService)
    {
    }

    public function index(Request $request, Tenancy $tenancy): JsonResponse
    {
        $this->authorize('view', $tenancy);

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
}
