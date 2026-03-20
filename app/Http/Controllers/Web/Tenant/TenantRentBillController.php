<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use App\Models\RentBill;
use Illuminate\Http\Request;

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

        if (!$activeTenancy) {
            return inertia('Tenant/RentBills/Index', [
                'rentBills' => [],
                'currentMonthBill' => null,
            ]);
        }

        $rentBills = RentBill::where('tenancy_id', $activeTenancy->id)
            ->orderBy('billing_month', 'desc')
            ->paginate(15);

        $currentMonthBill = RentBill::where('tenancy_id', $activeTenancy->id)
            ->where('billing_month', now()->startOfMonth())
            ->first();

        return inertia('Tenant/RentBills/Index', [
            'rentBills' => $rentBills,
            'currentMonthBill' => $currentMonthBill,
        ]);
    }

    /**
     * Show a single rent bill.
     * GET /tenant/rent-bills/{id}
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();
        $tenant = $user->tenant;
        
        // Get the active tenancy
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
            abort(404, 'No active tenancy found.');
        }

        $rentBill = RentBill::where('id', $id)
            ->where('tenancy_id', $activeTenancy->id)
            ->with(['payments', 'tenancy.unit', 'tenancy.unit.property'])
            ->firstOrFail();

        return inertia('Tenant/RentBills/Show', [
            'rentBill' => $rentBill,
        ]);
    }
}
