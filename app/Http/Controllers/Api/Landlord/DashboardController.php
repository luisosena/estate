<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Services\Landlord\ApiDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function __construct(
        protected ApiDashboardService $service
    ) {}

    public function index(Request $request)
    {
        try {
            $landlord = $request->user();
            if ($landlord->role !== Role::Landlord) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $data = $this->service->getDashboardData($landlord);

            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            Log::error('Dashboard data fetch failed', [
                'landlord_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Unable to load dashboard data. Please try again.',
            ], 500);
        }
    }
}
