<?php

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use App\Models\RentBill;
use App\Services\Tenant\TenantDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantDashboardController extends Controller
{
    public function __construct(protected TenantDashboardService $service) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', RentBill::class);

        return Inertia::render('tenant/dashboard', $this->service->getDashboardData($request->user()->tenant));
    }
}
