<?php

namespace App\Http\Controllers\Web\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Services\Landlord\LandlordDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandlordDashboardController extends Controller
{
    public function __construct(
        protected LandlordDashboardService $service
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', Property::class);

        return Inertia::render('landlord/dashboard', $this->service->getDashboardData($request->user()));
    }
}
