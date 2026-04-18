<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\RentBill;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'tenant' => ['id' => 0, 'full_name' => 'Guest'],
                    'payments' => [],
                ]);
            }

            $tenant = $user->tenant;

            if (! $tenant) {
                return response()->json([
                    'tenant' => ['id' => 0, 'full_name' => 'No Tenant Found'],
                    'payments' => [],
                ]);
            }

            $activeTenancy = $tenant->tenancies()
                ->where('tenancies.status', 'active')
                ->with(['unit', 'payments', 'tenancyUtilities.utilityType'])
                ->first();

            // Get rent bills for the tenant
            $rentBills = [];
            $currentMonthBill = null;

            if ($activeTenancy) {
                $rentBills = RentBill::where('tenancy_id', $activeTenancy->id)
                    ->orderBy('billing_month', 'desc')
                    ->take(5)
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
                        ];
                    });

                $currentMonthBill = RentBill::where('tenancy_id', $activeTenancy->id)
                    ->where('billing_month', now()->startOfMonth())
                    ->first();

                if ($currentMonthBill) {
                    $currentMonthBill = [
                        'id' => $currentMonthBill->id,
                        'billing_month' => $currentMonthBill->billing_month->format('Y-m'),
                        'amount_due' => $currentMonthBill->amount_due,
                        'amount_paid' => $currentMonthBill->amount_paid,
                        'outstanding_amount' => $currentMonthBill->outstanding_amount,
                        'due_date' => $currentMonthBill->due_date->format('Y-m-d'),
                        'status' => $currentMonthBill->status,
                    ];
                }
            }

            return response()->json([
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

                'rent_bills' => $rentBills,
                'current_month_bill' => $currentMonthBill,

                'utilities' => $activeTenancy?->tenancyUtilities,

                'notifications' => $tenant->notifications()
                    ->latest()
                    ->take(5)
                    ->get(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Api DashboardController error: '.$e->getMessage());

            return response()->json([
                'tenant' => ['id' => 0, 'full_name' => 'Error'],
                'payments' => [],
            ], 500);
        }
    }
}
