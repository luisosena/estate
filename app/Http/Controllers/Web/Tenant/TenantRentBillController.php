<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\RentBillResource;
use App\Models\RentBill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantRentBillController extends Controller
{
    /**
     * List all rent bills for the tenant.
     * GET /tenant/rent-bills
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        // Get the active tenancy
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return Inertia::render('tenant/rent-bills/index', [
                'rentBills' => null,
                'currentMonthBill' => null,
                'stats' => [
                    'total' => 0,
                    'pending' => 0,
                    'paid' => 0,
                ],
            ]);
        }

        $rentBills = RentBill::where('tenancy_id', $activeTenancy->id)
            ->with(['tenancy.unit.property'])
            ->orderBy('billing_month', 'desc')
            ->paginate(15);

        $currentMonthBill = RentBill::where('tenancy_id', $activeTenancy->id)
            ->where('billing_month', now()->startOfMonth())
            ->first();

        // Get stats
        $baseQuery = RentBill::where('tenancy_id', $activeTenancy->id);

        return Inertia::render('tenant/rent-bills/index', [
            'rentBills' => RentBillResource::collection($rentBills),
            'currentMonthBill' => $currentMonthBill ? new RentBillResource($currentMonthBill) : null,
            'stats' => [
                'total' => (clone $baseQuery)->count(),
                'pending' => (clone $baseQuery)->whereIn('status', ['pending', 'overdue', 'partial'])->count(),
                'paid' => (clone $baseQuery)->where('status', 'paid')->count(),
            ],
        ]);
    }

    /**
     * Show a single rent bill.
     * GET /tenant/rent-bills/{id}
     */
    public function show(RentBill $rentBill)
    {
        $this->authorize('view', $rentBill);

        $rentBill->load(['payments', 'tenancy.unit.property']);

        return Inertia::render('tenant/rent-bills/show', [
            'rentBill' => new RentBillResource($rentBill),
        ]);
    }
}
