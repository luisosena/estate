<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\RentBillResource;
use App\Models\RentBill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RentBillController extends Controller
{
    /**
     * Get all rent bills for the tenant.
     * GET /api/v1/tenant/rent-bills
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', RentBill::class);

        $user = $request->user();
        $tenant = $user->tenant;

        // Get the active tenancy
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 15,
                    'total' => 0,
                    'total_pages' => 0,
                ],
            ]);
        }

        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');

        $query = RentBill::where('tenancy_id', $activeTenancy->id)
            ->with(['tenancy.unit.property', 'payments']);

        if ($status) {
            $query->where('status', $status);
        }

        $totalItems = $query->count();
        $rentBills = $query->orderBy('billing_month', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        $totalPages = ceil($totalItems / $perPage);

        return response()->json([
            'data' => RentBillResource::collection($rentBills)->toArray($request),
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ]);
    }

    /**
     * Get current month's rent bill.
     * GET /api/v1/tenant/rent-bills/current
     */
    public function current(Request $request): JsonResponse
    {
        $this->authorize('viewAny', RentBill::class);

        $user = $request->user();
        $tenant = $user->tenant;

        // Get the active tenancy
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'unit.property'])
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'message' => 'No active tenancy found.',
            ], 404);
        }

        $rentBill = RentBill::where('tenancy_id', $activeTenancy->id)
            ->where('billing_month', now()->startOfMonth())
            ->with(['payments', 'tenancy.unit.property'])
            ->first();

        if (! $rentBill) {
            return response()->json([
                'message' => 'No rent bill found for current month.',
                'data' => [
                    'has_current_bill' => false,
                    'monthly_rent' => $activeTenancy->monthly_rent,
                    'unit' => $activeTenancy->unit ? [
                        'id' => $activeTenancy->unit->id,
                        'unit_code' => $activeTenancy->unit->unit_code,
                    ] : null,
                    'property' => $activeTenancy->unit?->property ? [
                        'id' => $activeTenancy->unit->property->id,
                        'name' => $activeTenancy->unit->property->name,
                    ] : null,
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'has_current_bill' => true,
                'rent_bill' => new RentBillResource($rentBill),
                'monthly_rent' => (float) $activeTenancy->monthly_rent,
            ],
        ]);
    }

    /**
     * Get a single rent bill.
     * GET /api/v1/tenant/rent-bills/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $rentBill = RentBill::where('id', $id)
            ->whereHas('tenancy', fn ($q) => $q->where('tenant_id', $request->user()->tenant_id))
            ->with(['payments', 'tenancy.unit', 'tenancy.unit.property'])
            ->firstOrFail();

        $this->authorize('view', $rentBill);

        return response()->json([
            'data' => new RentBillResource($rentBill),
        ]);
    }
}
