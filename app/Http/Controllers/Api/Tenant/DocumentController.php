<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $documentService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== Role::Tenant) {
            abort(403, 'Access denied.');
        }

        $tenancy = $user->tenant?->tenancies()->where('status', 'active')->first();

        if (! $tenancy) {
            return response()->json(['data' => []]);
        }

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
