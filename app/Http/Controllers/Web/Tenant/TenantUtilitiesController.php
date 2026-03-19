<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use App\Models\UtilityBill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantUtilitiesController extends Controller
{
    /**
     * Display tenant's utilities.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return redirect()
                ->route('dashboard')
                ->with('error', 'Tenant profile not found.');
        }

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit.property', 'tenancyUtilities.utilityType'])
            ->first();

        if (!$activeTenancy) {
            return Inertia::render('tenant/utilities', [
                'tenant' => [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                ],
                'tenancy' => null,
                'utilities' => [],
                'summary' => [
                    'monthly_total' => 0,
                    'active_count' => 0,
                ],
            ]);
        }

        $utilities = $activeTenancy->tenancyUtilities()
            ->with('utilityType')
            ->orderBy('created_at', 'desc')
            ->get();

        $monthlyTotal = $utilities
            ->where('billing_cycle', 'monthly')
            ->sum('amount');

        $quarterlyTotal = $utilities
            ->where('billing_cycle', 'quarterly')
            ->sum('amount') / 3;

        $annualTotal = $utilities
            ->where('billing_cycle', 'annual')
            ->sum('amount') / 12;

        $totalMonthly = $monthlyTotal + $quarterlyTotal + $annualTotal;

        return Inertia::render('tenant/utilities', [
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
            ],
            'tenancy' => [
                'id' => $activeTenancy->id,
                'unit' => $activeTenancy->unit->unit_name,
                'property' => $activeTenancy->unit->property->name,
                'monthly_rent' => $activeTenancy->monthly_rent,
            ],
            'utilities' => $utilities,
            'summary' => [
                'monthly_total' => $totalMonthly,
                'active_count' => $utilities->where('status', 'active')->count(),
                'utilities_count' => $utilities->count(),
            ],
        ]);
    }

    /**
     * Display tenant's pending utility bills.
     */
    public function bills(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return redirect()
                ->route('dashboard')
                ->with('error', 'Tenant profile not found.');
        }

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
            return Inertia::render('tenant/utilities/bills', [
                'tenant' => [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                ],
                'bills' => [],
                'summary' => [
                    'total_outstanding' => 0,
                    'bill_count' => 0,
                ],
            ]);
        }

        // Get all bills (not just pending)
        $query = UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
                $q->where('tenancy_id', $activeTenancy->id);
            })
            ->with(['tenancyUtility.utilityType']);

        // Filter by status if provided
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $bills = $query->orderBy('due_date', 'asc')
            ->orderBy('billing_month', 'desc')
            ->paginate(10);

        // Calculate summary using a single query with conditional aggregation
        $summaryResult = UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
                $q->where('tenancy_id', $activeTenancy->id);
            })
            ->selectRaw(
                "SUM(CASE WHEN status = 'pending' THEN (amount_due - amount_paid) ELSE 0 END) as total_pending,
                 SUM(CASE WHEN status = 'overdue' THEN (amount_due - amount_paid) ELSE 0 END) as total_overdue,
                 SUM(CASE WHEN status = 'partial' THEN (amount_due - amount_paid) ELSE 0 END) as total_partial,
                 SUM(amount_due - amount_paid) as total_outstanding,
                 COUNT(*) as bill_count"
            )
            ->first();

        $summary = [
            'total_outstanding' => $summaryResult->total_outstanding ?? 0,
            'total_pending' => $summaryResult->total_pending ?? 0,
            'total_overdue' => $summaryResult->total_overdue ?? 0,
            'total_partial' => $summaryResult->total_partial ?? 0,
            'bill_count' => (int) ($summaryResult->bill_count ?? 0),
        ];

        return Inertia::render('tenant/utilities/bills', [
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
            ],
            'tenancy' => [
                'id' => $activeTenancy->id,
            ],
            'bills' => $bills,
            'summary' => $summary,
            'filters' => [
                'status' => $request->status ?? '',
            ],
        ]);
    }
}
