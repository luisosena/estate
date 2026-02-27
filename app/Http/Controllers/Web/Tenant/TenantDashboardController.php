<?php

namespace App\Http\Controllers\Web\Tenant;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
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
                ->with(['unit', 'payments', 'utilities'])
                ->first();

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

                'utilities' => $activeTenancy?->utilities,

                'notifications' => $tenant->notifications()
                    ->latest()
                    ->take(5)
                    ->get(),
            ]);
        } catch (\Exception $e) {
            \Log::error('TenantDashboardController error: ' . $e->getMessage());
            
            return Inertia::render('tenant/dashboard', [
                'tenant' => ['id' => 0, 'full_name' => 'Error'],
                'payments' => [],
            ]);
        }
    }

    /**
     * Show specific tenant dashboard for landlord view.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Tenant $tenant
     * @return \Inertia\Response
     */
    public function show(Request $request, Tenant $tenant)
    {
        try {
            $landlord = $request->user();
            
            // Authorization: ensure landlord can view this tenant
            if (!$tenant->tenancies()->whereHas('unit.property', function ($query) use ($landlord) {
                $query->where('owner_id', $landlord->id);
            })->exists()) {
                abort(403, 'You do not have access to view this tenant.');
            }

            $activeTenancy = $tenant->tenancies()
                ->where('status', 'active')
                ->with(['unit', 'payments', 'utilities'])
                ->first();

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

                'utilities' => $activeTenancy?->utilities,

                'notifications' => $tenant->notifications()
                    ->latest()
                    ->take(5)
                    ->get(),
            ]);
        } catch (\Exception $e) {
            \Log::error('TenantDashboardController show error: ' . $e->getMessage());
            
            return Inertia::render('tenant/dashboard', [
                'tenant' => ['id' => 0, 'full_name' => 'Error'],
                'payments' => [],
            ]);
        }
    }
}
