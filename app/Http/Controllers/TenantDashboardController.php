<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TenantDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tenant = $user->tenant;

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
                ->sortByDesc('created_at')
                ->take(5)
                ->values(),

            'utilities' => $activeTenancy?->utilities,

            'notifications' => $tenant->notifications()
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }
}