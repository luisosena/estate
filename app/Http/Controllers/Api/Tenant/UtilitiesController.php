<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\UtilityBill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UtilitiesController extends Controller
{
    /**
     * Get utilities for the authenticated tenant.
     * GET /api/v1/tenant/utilities
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (! $tenant) {
            return response()->json(['message' => 'Tenant profile not found'], 404);
        }

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['tenancyUtilities.utilityType'])
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'data' => [],
                'message' => 'No active tenancy found',
            ]);
        }

        return response()->json([
            'data' => $activeTenancy->tenancyUtilities->map(fn ($u) => [
                'id' => $u->id,
                'tenancy_id' => $u->tenancy_id,
                'utility_type_id' => $u->utility_type_id,
                'amount' => $u->amount,
                'billing_cycle' => $u->billing_cycle,
                'provider' => $u->provider,
                'account_number' => $u->account_number,
                'meter_number' => $u->meter_number,
                'status' => $u->status,
                'notes' => $u->notes,
                'utility_type' => $u->utilityType ? [
                    'id' => $u->utilityType->id,
                    'name' => $u->utilityType->name,
                    'unit' => $u->utilityType->unit,
                ] : null,
            ]),
            'tenancy' => [
                'id' => $activeTenancy->id,
                'monthly_rent' => $activeTenancy->monthly_rent,
            ],
        ]);
    }

    /**
     * Get pending utility bills for the authenticated tenant.
     * GET /api/v1/tenant/utility-bills
     */
    public function bills(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenant = $user->tenant;

        if (! $tenant) {
            return response()->json(['message' => 'Tenant profile not found'], 404);
        }

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (! $activeTenancy) {
            return response()->json([
                'data' => [],
                'message' => 'No active tenancy found',
            ]);
        }

        // Get pending bills with optional filters
        $query = UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
            $q->where('tenancy_id', $activeTenancy->id);
        })
            ->with(['tenancyUtility.utilityType']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default: show pending, partial, and overdue
            $query->whereIn('status', ['pending', 'partial', 'overdue']);
        }

        $bills = $query->orderBy('due_date', 'asc')
            ->orderBy('billing_month', 'desc')
            ->get();

        // Calculate totals
        $totalDue = $bills->sum('amount_due');
        $totalPaid = $bills->sum('amount_paid');
        $totalOutstanding = $totalDue - $totalPaid;

        return response()->json([
            'data' => $bills->map(fn ($b) => [
                'id' => $b->id,
                'tenancy_utility_id' => $b->tenancy_utility_id,
                'billing_month' => $b->billing_month?->format('Y-m'),
                'units_consumed' => $b->units_consumed,
                'amount_due' => $b->amount_due,
                'amount_paid' => $b->amount_paid,
                'due_date' => $b->due_date?->toIso8601String(),
                'status' => $b->status,
                'notes' => $b->notes,
                'tenancy_utility' => $b->tenancyUtility ? [
                    'id' => $b->tenancyUtility->id,
                    'provider' => $b->tenancyUtility->provider,
                    'account_number' => $b->tenancyUtility->account_number,
                    'utility_type' => $b->tenancyUtility->utilityType ? [
                        'id' => $b->tenancyUtility->utilityType->id,
                        'name' => $b->tenancyUtility->utilityType->name,
                    ] : null,
                ] : null,
            ]),
            'summary' => [
                'total_due' => $totalDue,
                'total_paid' => $totalPaid,
                'total_outstanding' => $totalOutstanding,
                'bill_count' => $bills->count(),
            ],
        ]);
    }
}
