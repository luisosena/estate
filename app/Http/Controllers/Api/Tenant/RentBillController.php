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

        $query = RentBill::where('tenancy_id', $activeTenancy->id);

        if ($status) {
            $query->where('status', $status);
        }

        $totalItems = $query->count();
        $rentBills = $query->orderBy('billing_month', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'billing_month' => $bill->billing_month->format('Y-m'),
                    'amount_due' => $bill->amount_due,
                    'amount_paid' => $bill->amount_paid,
                    'outstanding_amount' => $bill->outstanding_amount,
                    'due_date' => $bill->due_date->format('Y-m-d'),
                    'status' => $bill->status,
                    'notes' => $bill->notes,
                    'created_at' => $bill->created_at,
                ];
            });

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
     * Get current month's rent bill.
     * GET /api/v1/tenant/rent-bills/current
     */
    public function current(Request $request)
    {
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
            ->with('payments:id,amount,payment_method,paid_at,status')
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
            'has_current_bill' => true,
            'rent_bill' => [
                'id' => $rentBill->id,
                'billing_month' => $rentBill->billing_month->format('Y-m'),
                'amount_due' => $rentBill->amount_due,
                'amount_paid' => $rentBill->amount_paid,
                'outstanding_amount' => $rentBill->outstanding_amount,
                'due_date' => $rentBill->due_date->format('Y-m-d'),
                'status' => $rentBill->status,
                'notes' => $rentBill->notes,
                'payments' => $rentBill->payments->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'amount' => $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'paid_at' => $payment->paid_at,
                        'status' => $payment->status,
                    ];
                }),
            ],
            'monthly_rent' => $activeTenancy->monthly_rent,
            'unit' => $activeTenancy->unit ? [
                'id' => $activeTenancy->unit->id,
                'unit_code' => $activeTenancy->unit->unit_code,
            ] : null,
            'property' => $activeTenancy->unit?->property ? [
                'id' => $activeTenancy->unit->property->id,
                'name' => $activeTenancy->unit->property->name,
            ] : null,
        ]);
    }

    /**
     * Get a single rent bill.
     * GET /api/v1/tenant/rent-bills/{id}
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();
        $tenant = $user->tenant;

        // Get the active tenancy
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'message' => 'No active tenancy found.',
            ], 404);
        }

        $rentBill = RentBill::where('id', $id)
            ->where('tenancy_id', $activeTenancy->id)
            ->with(['payments:id,amount,payment_method,paid_at,status', 'tenancy.unit', 'tenancy.unit.property'])
            ->first();

        if (! $rentBill) {
            return response()->json([
                'message' => 'Rent bill not found or does not belong to your active tenancy.',
            ], 404);
        }

        return response()->json([
            'id' => $rentBill->id,
            'billing_month' => $rentBill->billing_month->format('Y-m'),
            'amount_due' => $rentBill->amount_due,
            'amount_paid' => $rentBill->amount_paid,
            'outstanding_amount' => $rentBill->outstanding_amount,
            'due_date' => $rentBill->due_date->format('Y-m-d'),
            'status' => $rentBill->status,
            'notes' => $rentBill->notes,
            'payments' => $rentBill->payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'paid_at' => $payment->paid_at,
                    'status' => $payment->status,
                ];
            }),
            'unit' => $rentBill->tenancy?->unit ? [
                'id' => $rentBill->tenancy->unit->id,
                'unit_code' => $rentBill->tenancy->unit->unit_code,
            ] : null,
            'property' => $rentBill->tenancy?->unit?->property ? [
                'id' => $rentBill->tenancy->unit->property->id,
                'name' => $rentBill->tenancy->unit->property->name,
            ] : null,
            'created_at' => $rentBill->created_at,
        ]);
    }
}
