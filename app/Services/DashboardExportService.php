<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class DashboardExportService
{
    public function exportLandlordDashboardCsv(User $landlord): Response
    {
        $propertyIds = $landlord->properties()->pluck('id');
        $unitIds = Unit::whereIn('property_id', $propertyIds)->pluck('id');
        $tenancyIds = Tenancy::whereIn('unit_id', $unitIds)->pluck('id');

        $properties = $landlord->properties()
            ->withCount(['units'])
            ->withCount(['tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }])
            ->get();

        $payments = Payment::whereIn('tenancy_id', $tenancyIds)
            ->where('status', 'paid')
            ->with(['tenant', 'tenancy.unit'])
            ->orderByDesc('paid_at')
            ->limit(100)
            ->get();

        $rentBills = RentBill::whereIn('tenancy_id', $tenancyIds)
            ->with(['tenancy.tenant', 'tenancy.unit'])
            ->orderByDesc('billing_month')
            ->limit(100)
            ->get();

        $csvData = $this->buildLandlordCsvData($landlord, $properties, $payments, $rentBills);

        return response()->streamDownload(function () use ($csvData) {
            $handle = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, 'landlord-dashboard-report.csv', ['Content-Type' => 'text/csv']);
    }

    public function exportLandlordDashboardPdf(User $landlord): Response
    {
        $propertyIds = $landlord->properties()->pluck('id');
        $unitIds = Unit::whereIn('property_id', $propertyIds)->pluck('id');
        $tenancyIds = Tenancy::whereIn('unit_id', $unitIds)->pluck('id');

        $properties = $landlord->properties()
            ->withCount(['units'])
            ->withCount(['tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }])
            ->get();

        $totalUnits = $properties->sum('units_count');
        $totalTenants = $properties->sum('active_tenants_count');
        $occupiedUnits = Unit::whereIn('id', $unitIds)
            ->whereHas('tenancies', fn ($q) => $q->where('tenancies.status', 'active'))
            ->distinct('units.id')
            ->count();
        $monthlyRevenue = Tenancy::whereIn('unit_id', $unitIds)
            ->where('status', 'active')
            ->sum('monthly_rent');

        $recentPayments = Payment::whereIn('tenancy_id', $tenancyIds)
            ->where('status', 'paid')
            ->with(['tenant', 'tenancy.unit'])
            ->orderByDesc('paid_at')
            ->limit(10)
            ->get();

        $rentStats = (new RentBillService)->getRentStatistics($landlord);

        $pdf = Pdf::loadView('exports.landlord-dashboard-pdf', [
            'landlord' => $landlord,
            'stats' => [
                'total_properties' => $properties->count(),
                'total_units' => $totalUnits,
                'occupied_units' => $occupiedUnits,
                'vacant_units' => max(0, $totalUnits - $occupiedUnits),
                'total_tenants' => $totalTenants,
                'monthly_revenue' => $monthlyRevenue,
                'pending_rent_bills' => $rentStats['pending'] ?? 0,
                'overdue_rent_bills' => $rentStats['overdue'] ?? 0,
                'total_rent_outstanding' => $rentStats['total_outstanding'] ?? 0,
            ],
            'properties' => $properties,
            'recentPayments' => $recentPayments,
            'exportedAt' => now(),
        ]);

        return $pdf->download('landlord-dashboard-report.pdf');
    }

    public function exportTenantDashboardCsv(User $user): Response
    {
        $tenant = $user->tenant;
        if (! $tenant) {
            abort(404, 'Tenant profile not found.');
        }

        $activeTenancy = $tenant->tenancies()
            ->where('tenancies.status', 'active')
            ->with(['unit', 'payments', 'rentBills'])
            ->first();

        if (! $activeTenancy) {
            abort(404, 'No active tenancy found.');
        }

        $csvData = $this->buildTenantCsvData($tenant, $activeTenancy);

        return response()->streamDownload(function () use ($csvData) {
            $handle = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, 'tenant-dashboard-report.csv', ['Content-Type' => 'text/csv']);
    }

    public function exportTenantDashboardPdf(User $user): Response
    {
        $tenant = $user->tenant;
        if (! $tenant) {
            abort(404, 'Tenant profile not found.');
        }

        $activeTenancy = $tenant->tenancies()
            ->where('tenancies.status', 'active')
            ->with(['unit.property', 'payments', 'rentBills'])
            ->first();

        if (! $activeTenancy) {
            abort(404, 'No active tenancy found.');
        }

        $pdf = Pdf::loadView('exports.tenant-dashboard-pdf', [
            'tenant' => $tenant,
            'tenancy' => $activeTenancy,
            'unit' => $activeTenancy->unit,
            'payments' => $activeTenancy->payments->sortByDesc(fn ($p) => $p->paid_at ?? $p->created_at)->take(10),
            'rentBills' => $activeTenancy->rentBills->sortByDesc('billing_month')->take(10),
            'exportedAt' => now(),
        ]);

        return $pdf->download('tenant-dashboard-report.pdf');
    }

    protected function buildLandlordCsvData(User $landlord, Collection $properties, Collection $payments, Collection $rentBills): array
    {
        $rows = [];

        $rows[] = ['LANDLORD DASHBOARD REPORT'];
        $rows[] = ['Generated', now()->format('Y-m-d H:i:s')];
        $rows[] = ['Landlord', $landlord->name];
        $rows[] = [];

        $rows[] = ['PROPERTY SUMMARY'];
        $rows[] = ['Total Properties', $properties->count()];
        $rows[] = ['Total Units', $properties->sum('units_count')];
        $rows[] = ['Total Tenants', $properties->sum('active_tenants_count')];
        $rows[] = [];

        $rows[] = ['PROPERTIES'];
        $rows[] = ['Name', 'Address', 'Units', 'Active Tenants'];
        foreach ($properties as $property) {
            $rows[] = [
                $property->name,
                $property->address,
                $property->units_count,
                $property->active_tenants_count,
            ];
        }
        $rows[] = [];

        $rows[] = ['RECENT PAYMENTS'];
        $rows[] = ['Date', 'Tenant', 'Unit', 'Amount', 'Status'];
        foreach ($payments as $payment) {
            $rows[] = [
                $payment->paid_at?->format('Y-m-d') ?? '',
                $payment->tenant?->full_name ?? '',
                $payment->tenancy?->unit?->unit_code ?? '',
                $payment->amount,
                $payment->status,
            ];
        }
        $rows[] = [];

        $rows[] = ['RENT BILLS'];
        $rows[] = ['Billing Month', 'Tenant', 'Unit', 'Amount Due', 'Amount Paid', 'Status'];
        foreach ($rentBills as $bill) {
            $rows[] = [
                $bill->billing_month?->format('Y-m') ?? '',
                $bill->tenancy?->tenant?->full_name ?? '',
                $bill->tenancy?->unit?->unit_code ?? '',
                $bill->amount_due,
                $bill->amount_paid,
                $bill->status,
            ];
        }

        return $rows;
    }

    protected function buildTenantCsvData($tenant, $tenancy): array
    {
        $rows = [];

        $rows[] = ['TENANT DASHBOARD REPORT'];
        $rows[] = ['Generated', now()->format('Y-m-d H:i:s')];
        $rows[] = ['Tenant', $tenant->full_name];
        $rows[] = [];

        $rows[] = ['TENANCY DETAILS'];
        $rows[] = ['Unit', $tenancy->unit?->unit_name ?? ''];
        $rows[] = ['Unit Code', $tenancy->unit?->unit_code ?? ''];
        $rows[] = ['Monthly Rent', $tenancy->monthly_rent];
        $rows[] = ['Move In Date', $tenancy->move_in_date?->format('Y-m-d') ?? ''];
        $rows[] = ['Status', $tenancy->status];
        $rows[] = [];

        $rows[] = ['PAYMENT HISTORY'];
        $rows[] = ['Date', 'Amount', 'Type', 'Method', 'Status'];
        foreach ($tenancy->payments->sortByDesc(fn ($p) => $p->paid_at ?? $p->created_at)->take(20) as $payment) {
            $rows[] = [
                $payment->paid_at?->format('Y-m-d') ?? '',
                $payment->amount,
                $payment->payment_type,
                $payment->payment_method,
                $payment->status,
            ];
        }
        $rows[] = [];

        $rows[] = ['RENT BILLS'];
        $rows[] = ['Billing Month', 'Amount Due', 'Amount Paid', 'Status'];
        foreach ($tenancy->rentBills->sortByDesc('billing_month')->take(20) as $bill) {
            $rows[] = [
                $bill->billing_month?->format('Y-m') ?? '',
                $bill->amount_due,
                $bill->amount_paid,
                $bill->status,
            ];
        }

        return $rows;
    }
}
