<?php

namespace App\Http\Controllers\Web\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'tenant' => ['id' => 0, 'full_name' => 'Guest'],
                    'payments' => [],
                ]);
            }

            $tenant = $user->tenant;

            if (!$tenant) {
                return response()->json([
                    'tenant' => ['id' => 0, 'full_name' => 'No Tenant Found'],
                    'payments' => [],
                ]);
            }

            $activeTenancy = $tenant->tenancies()
                ->where('status', 'active')
                ->with(['unit', 'payments', 'utilities'])
                ->first();

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

                'utilities' => $activeTenancy?->utilities,

                'notifications' => $tenant->notifications()
                    ->latest()
                    ->take(5)
                    ->get(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Api DashboardController error: ' . $e->getMessage());
            
            return response()->json([
                'tenant' => ['id' => 0, 'full_name' => 'Error'],
                'payments' => [],
            ], 500);
        }
    }
}
