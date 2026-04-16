<?php

namespace App\Http\Controllers\Web\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\RentBill;
use App\Http\Resources\RentBillResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\TenancyUtilityResource;
use App\Http\Resources\NotificationResource;
use App\Http\Resources\TenantResource;
use Inertia\Inertia;

class TenantDashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return Inertia::render('tenant/dashboard', [
                    'tenant' => ['data' => ['id' => 0, 'full_name' => 'Guest']],
                    'payments' => ['data' => []],
                ]);
            }

            $tenant = $user->tenant;

            if (!$tenant) {
                return Inertia::render('tenant/dashboard', [
                    'tenant' => ['data' => ['id' => 0, 'full_name' => 'No Tenant Found']],
                    'payments' => ['data' => []],
                ]);
            }

            $activeTenancy = $tenant->tenancies()
                ->where('status', 'active')
                ->with(['unit', 'payments', 'tenancyUtilities.utilityType', 'tenancyUtilities.bills'])
                ->first();

            // Get rent bills for the tenant's active tenancy
            $rentBills = collect([]);
            $currentMonthBill = null;

            if ($activeTenancy) {
                // Fetch recent bills for display (not including current month)
                $recentBills = RentBill::where('tenancy_id', $activeTenancy->id)
                    ->where('billing_month', '<', now()->startOfMonth())
                    ->orderBy('billing_month', 'desc')
                    ->limit(5)
                    ->get();

                $rentBills = RentBillResource::collection($recentBills);

                // Get current month's bill
                $currentMonthBillData = RentBill::where('tenancy_id', $activeTenancy->id)
                    ->where('billing_month', now()->startOfMonth())
                    ->first();

                if ($currentMonthBillData) {
                    $currentMonthBill = new RentBillResource($currentMonthBillData);
                }
            }

            return Inertia::render('tenant/dashboard', [
                'tenant' => new TenantResource($tenant),

                'unit' => $activeTenancy?->unit,

                'tenancy' => $activeTenancy ? [
                    'move_in_date' => $activeTenancy->move_in_date,
                    'status' => $activeTenancy->status,
                ] : null,

                'payments' => PaymentResource::collection($activeTenancy?->payments
                    ->sortByDesc(function ($payment) {
                        return $payment->paid_at ?? $payment->created_at;
                    })
                    ->take(5)
                    ->values() ?? collect([])),

                'utilities' => TenancyUtilityResource::collection($activeTenancy?->tenancyUtilities ?? collect([])),

                'notifications' => NotificationResource::collection($tenant->user->notifications()
                    ->latest()
                    ->take(5)
                    ->get()),

                'rent_bills' => $rentBills,
                'current_month_bill' => $currentMonthBill ?? ['data' => null],
            ]);
        } catch (\Exception $e) {
            \Log::error('TenantDashboardController error: ' . $e->getMessage());
            
            return Inertia::render('tenant/dashboard', [
                'tenant' => ['data' => ['id' => 0, 'full_name' => 'Error']],
                'payments' => ['data' => []],
            ]);
        }
    }
}
