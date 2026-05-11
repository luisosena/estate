<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\RentBill;
use App\Models\Tenancy;
use Illuminate\Http\Request;

class RentBillController extends Controller
{
    /**
     * Get all rent bills for the tenant.
     * GET /api/v1/tenant/rent-bills
     */
    public function index(Request $request)
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
            ->with(['tenancy.unit.property']);

        if ($status) {
            $query->where('status', $status);
        }

        $totalItems = $query->count();
        $rentBills = $query->orderBy('billing_month', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn ($bill) => $this->transformRentBill($bill));

        $totalPages = ceil($totalItems / $perPage);

        return response()->json([
            'data' => $rentBills,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => (int) $perPage,
                'total' => $totalItems,
                'total_pages' => $totalPages,
            ],
        ]);
    }

    /**
     * Transform a rent bill model into a standardized array.
     */
    private function transformRentBill(RentBill $bill): array
    {
        return [
            'id' => $bill->id,
            'billing_month' => $bill->billing_month?->format('Y-m'),
            'amount_due' => (float) $bill->amount_due,
            'amount_paid' => (float) $bill->amount_paid,
            'outstanding_amount' => (float) $bill->outstanding_amount,
            'due_date' => $bill->due_date?->format('Y-m-d'),
            'status' => $bill->status,
            'notes' => $bill->notes,
            'unit' => $bill->tenancy?->unit ? [
                'id' => $bill->tenancy->unit->id,
                'unit_code' => $bill->tenancy->unit->unit_code,
            ] : null,
            'property' => $bill->tenancy?->unit?->property ? [
                'id' => $bill->tenancy->unit->property->id,
                'name' => $bill->tenancy->unit->property->name,
            ] : null,
            'payments' => $bill->relationLoaded('payments') ? $bill->payments->map(fn ($p) => [
                'id' => $p->id,
                'amount' => (float) $p->amount,
                'paid_at' => $p->paid_at ? $p->paid_at->toISOString() : null,
                'status' => $p->status,
            ]) : [],
            'created_at' => $bill->created_at,
        ];
    }

    /**
     * Get current month's rent bill.
     * GET /api/v1/tenant/rent-bills/current
     */
    public function current(Request $request)
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
            ->with(['payments:id,amount,payment_method,paid_at,status', 'tenancy.unit.property'])
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
                'rent_bill' => $this->transformRentBill($rentBill),
                'monthly_rent' => (float) $activeTenancy->monthly_rent,
            ],
        ]);
    }

    /**
     * Get a single rent bill.
     * GET /api/v1/tenant/rent-bills/{id}
     */
    public function show(Request $request, int $id)
    {
        $rentBill = RentBill::with(['payments:id,amount,payment_method,paid_at,status', 'tenancy.unit', 'tenancy.unit.property'])
            ->findOrFail($id);
        $this->authorize('view', $rentBill);

        return response()->json([
            'data' => array_merge($this->transformRentBill($rentBill), [
                'payments' => $rentBill->payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => (float) $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'paid_at' => $payment->paid_at ? $payment->paid_at->toISOString() : null,
                        'status' => $payment->status,
                    ];
                }),
            ]),
        ]);
    }
}
