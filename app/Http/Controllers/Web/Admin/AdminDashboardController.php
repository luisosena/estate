<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\Role;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminDashboardService;
use App\Services\Landlord\RevenueAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __construct(
        protected AdminDashboardService $dashboardService,
        protected RevenueAnalyticsService $analyticsService
    ) {}

    public function index(Request $request)
    {
        if (! $request->user() || $request->user()->role !== Role::Admin) {
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        $months = (int) $request->get('months', 6);

        return Inertia::render('admin/dashboard', [
            ...$this->dashboardService->getDashboardData(),
            'revenueTrend' => $this->analyticsService->getSystemRevenueTrend($months),
        ]);
    }

    public function auditReports(Request $request)
    {
        if (! $request->user() || $request->user()->role !== Role::Admin) {
            return redirect()->route('login')->with('error', 'Access denied.');
        }

        $recentLandlords = \App\Models\User::where('role', 'landlord')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at']);

        $recentProperties = \App\Models\Property::with('landlord:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'name', 'address', 'status', 'owner_id', 'created_at']);

        $recentTenancies = \App\Models\Tenancy::with(['tenant:id,full_name', 'unit:id,unit_code'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'tenant_id', 'unit_id', 'status', 'monthly_rent', 'created_at']);

        $recentPayments = \App\Models\Payment::with(['tenant:id,full_name', 'tenancy.unit:id,unit_code'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'tenant_id', 'tenancy_id', 'amount', 'status', 'payment_type', 'created_at']);

        return Inertia::render('admin/audit-reports', [
            'recentLandlords' => $recentLandlords,
            'recentProperties' => $recentProperties,
            'recentTenancies' => $recentTenancies,
            'recentPayments' => $recentPayments,
        ]);
    }
}
