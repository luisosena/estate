<?php

namespace App\Http\Controllers\Web\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\RentBill;
use Inertia\Inertia;

class TenantDashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return Inertia::render('tenant/dashboard', [
                    'tenant' => ['id' => 0, 'full_name' => 'Guest'],
                    'payments' => [],
                ]);
            }

            $tenant = $user->tenant;

            if (!$tenant) {
                return Inertia::render('tenant/dashboard', [
                    'tenant' => ['id' => 0, 'full_name' => 'No Tenant Found'],
                    'payments' => [],
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

                // Map recent bills for display
                $rentBills = $recentBills->map(function ($bill) {
                    return [
                        'id' => $bill->id,
                        'billing_month' => $bill->billing_month,
                        'amount_due' => (float) $bill->amount_due,
                        'amount_paid' => (float) $bill->amount_paid,
                        'due_date' => $bill->due_date,
                        'status' => $bill->status,
                        'outstanding_amount' => (float) $bill->outstanding_amount,
                    ];
                });

                // Get current month's bill with a separate efficient query
                $currentMonthBillData = RentBill::where('tenancy_id', $activeTenancy->id)
                    ->where('billing_month', now()->startOfMonth())
                    ->first();

                if ($currentMonthBillData) {
                    $currentMonthBill = [
                        'id' => $currentMonthBillData->id,
                        'billing_month' => $currentMonthBillData->billing_month,
                        'amount_due' => (float) $currentMonthBillData->amount_due,
                        'amount_paid' => (float) $currentMonthBillData->amount_paid,
                        'due_date' => $currentMonthBillData->due_date,
                        'status' => $currentMonthBillData->status,
                        'outstanding_amount' => (float) $currentMonthBillData->outstanding_amount,
                    ];
                }
            }

            return Inertia::render('tenant/dashboard', [
                'tenant' => [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                    'phone' => $tenant->phone,
                    'email' => $tenant->email,
                ],

                'unit' => $activeTenancy?->unit,

                'tenancy' => $activeTenancy ? [
                    'move_in_date' => $activeTenancy->move_in_date,
                    'status' => $activeTenancy->status,
                ] : null,

                'payments' => $activeTenancy?->payments
                    ->sortByDesc(function ($payment) {
                        return $payment->paid_at ?? $payment->created_at;
                    })
                    ->take(5)
                    ->values() ?? [],

                'utilities' => $activeTenancy?->tenancyUtilities
                    ?->map(function ($u) {
                        $pendingBills = $u->bills
                            ?->filter(fn($b) => in_array($b->status, ['pending', 'partial', 'overdue'])) ?? collect();
                        return [
                            'id' => $u->id,
                            'amount' => $u->amount,
                            'billing_cycle' => $u->billing_cycle,
                            'status' => $pendingBills->isEmpty() ? 'paid' : $pendingBills->first()->status,
                            'utility_type' => $u->utilityType?->name,
                            'pending_balance' => $pendingBills->sum(fn($b) => $b->amount_due - $b->amount_paid),
                        ];
                    })
                    ?->values() ?? [],

                'notifications' => $tenant->user->notifications()
                    ->latest()
                    ->take(5)
                    ->get(),

                'rent_bills' => $rentBills,
                'current_month_bill' => $currentMonthBill,
            ]);
        } catch (\Exception $e) {
            \Log::error('TenantDashboardController error: ' . $e->getMessage());
            
            return Inertia::render('tenant/dashboard', [
                'tenant' => ['id' => 0, 'full_name' => 'Error'],
                'payments' => [],
            ]);
        }
    }
}
