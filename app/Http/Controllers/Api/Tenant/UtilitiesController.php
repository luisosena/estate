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

        if (!$tenant) {
            return response()->json(['message' => 'Tenant profile not found'], 404);
        }

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['tenancyUtilities.utilityType'])
            ->first();

        if (!$activeTenancy) {
            return response()->json([
                'data' => [],
                'message' => 'No active tenancy found',
            ]);
        }

        return response()->json([
            'data' => $activeTenancy->tenancyUtilities,
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

        if (!$tenant) {
            return response()->json(['message' => 'Tenant profile not found'], 404);
        }

        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
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
            'data' => $bills,
            'summary' => [
                'total_due' => $totalDue,
                'total_paid' => $totalPaid,
                'total_outstanding' => $totalOutstanding,
                'bill_count' => $bills->count(),
            ],
        ]);
    }
}
