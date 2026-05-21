<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        $this->authorize('viewAny', User::class);

        $months = min(max((int) $request->get('months', 6), 1), 24);

        return Inertia::render('admin/dashboard', [
            ...$this->dashboardService->getDashboardData(),
            'revenueTrend' => $this->analyticsService->getSystemRevenueTrend($months),
        ]);
    }

    public function auditReports(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('admin/audit-reports', $this->dashboardService->getAuditReportData());
    }
}
