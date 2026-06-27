<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Services\Landlord\LandlordDashboardService;
use App\Services\Landlord\RevenueAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordDashboardController extends Controller
{
    public function __construct(
        protected LandlordDashboardService $dashboardService,
        protected RevenueAnalyticsService $analyticsService
    ) {}

    public function index(Request $request)
    {
        // TODO: Sentry test — remove after verifying
        throw new \Exception('Sentry test — delete me after confirming it works');

        $this->authorize('viewAny', Property::class);

        $months = min(max((int) $request->get('months', 6), 1), 24);

        return Inertia::render('landlord/dashboard', [
            ...$this->dashboardService->getDashboardData($request->user()),
            'revenueTrend' => $this->analyticsService->getMonthlyRevenueTrend($request->user(), $months),
            'collectionTrend' => $this->analyticsService->getPaymentCollectionTrend($request->user(), $months),
        ]);
    }
}
