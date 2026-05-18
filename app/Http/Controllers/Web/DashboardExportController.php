<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\DashboardExportService;
use Illuminate\Http\Request;

class DashboardExportController extends Controller
{
    public function __construct(
        protected DashboardExportService $exportService
    ) {}

    public function landlordCsv(Request $request)
    {
        return $this->exportService->exportLandlordDashboardCsv($request->user());
    }

    public function landlordPdf(Request $request)
    {
        return $this->exportService->exportLandlordDashboardPdf($request->user());
    }

    public function tenantCsv(Request $request)
    {
        return $this->exportService->exportTenantDashboardCsv($request->user());
    }

    public function tenantPdf(Request $request)
    {
        return $this->exportService->exportTenantDashboardPdf($request->user());
    }
}
