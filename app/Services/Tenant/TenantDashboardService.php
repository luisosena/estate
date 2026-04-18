<?php

namespace App\Services\Tenant;

use App\Http\Resources\NotificationResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\RentBillResource;
use App\Http\Resources\TenancyUtilityResource;
use App\Http\Resources\TenantResource;
use App\Models\RentBill;
use App\Models\Tenant;

class TenantDashboardService
{
    /**
     * Get data for the tenant dashboard.
     */
    public function getDashboardData(Tenant $tenant): array
    {
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'payments', 'tenancyUtilities.utilityType', 'tenancyUtilities.bills'])
            ->first();

        $rentBills = collect([]);
        $currentMonthBill = null;

        if ($activeTenancy) {
            // Recent bills (past months)
            $recentBills = RentBill::where('tenancy_id', $activeTenancy->id)
                ->where('billing_month', '<', now()->startOfMonth())
                ->orderBy('billing_month', 'desc')
                ->limit(5)
                ->get();

            $rentBills = RentBillResource::collection($recentBills);

            // Current month's bill
            $currentMonthBillData = RentBill::where('tenancy_id', $activeTenancy->id)
                ->where('billing_month', now()->startOfMonth())
                ->first();

            if ($currentMonthBillData) {
                $currentMonthBill = new RentBillResource($currentMonthBillData);
            }
        }

        return [
            'tenant' => new TenantResource($tenant),
            'unit' => $activeTenancy?->unit,
            'tenancy' => $activeTenancy ? [
                'move_in_date' => $activeTenancy->move_in_date,
                'status' => $activeTenancy->status,
            ] : null,
            'payments' => PaymentResource::collection($activeTenancy?->payments
                ->sortByDesc(fn ($p) => $p->paid_at ?? $p->created_at)
                ->take(5)
                ->values() ?? collect([])),
            'utilities' => TenancyUtilityResource::collection($activeTenancy?->tenancyUtilities ?? collect([])),
            'notifications' => NotificationResource::collection($tenant->user->notifications()
                ->latest()
                ->take(5)
                ->get()),
            'rent_bills' => $rentBills,
            'current_month_bill' => $currentMonthBill ?? ['data' => null],
        ];
    }
}
