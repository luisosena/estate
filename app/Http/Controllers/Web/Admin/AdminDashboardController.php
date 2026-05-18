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
}
