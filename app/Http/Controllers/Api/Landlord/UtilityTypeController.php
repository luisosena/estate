<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\UtilityType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UtilityTypeController extends Controller
{
    /**
     * Get all utility types.
     * GET /api/v1/landlord/utility-types
     */
    public function index(Request $request): JsonResponse
    {
        $utilityTypes = UtilityType::query()
            ->when($request->has('active'), function ($query) {
                $query->active();
            })
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $utilityTypes,
        ]);
    }

    /**
     * Get a single utility type.
     * GET /api/v1/landlord/utility-types/{utilityType}
     */
    public function show(UtilityType $utilityType): JsonResponse
    {
        return response()->json([
            'data' => $utilityType->load('tenancyUtilities'),
        ]);
    }
}
