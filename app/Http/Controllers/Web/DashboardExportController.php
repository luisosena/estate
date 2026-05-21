<?php

namespace App\Http\Controllers\Web;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Services\DashboardExportService;
use Illuminate\Http\Request;

class DashboardExportController extends Controller
{
    public function __construct(
        protected DashboardExportService $exportService
    ) {}

    public function landlordCsv(Request $request)
    {
        $this->authorize('viewAny', Property::class);

        return $this->exportService->exportLandlordDashboardCsv($request->user());
    }

    public function landlordPdf(Request $request)
    {
        $this->authorize('viewAny', Property::class);

        return $this->exportService->exportLandlordDashboardPdf($request->user());
    }

    public function tenantCsv(Request $request)
    {
        abort_if($request->user()->role !== Role::Tenant, 403);

        return $this->exportService->exportTenantDashboardCsv($request->user());
    }

    public function tenantPdf(Request $request)
    {
        abort_if($request->user()->role !== Role::Tenant, 403);

        return $this->exportService->exportTenantDashboardPdf($request->user());
    }
}
