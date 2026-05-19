<?php

namespace App\Services\Landlord;

use App\Models\Payment;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use App\Services\RentBillService;
use Illuminate\Support\Collection;

class ApiDashboardService
{
    public function __construct(
        protected RentBillService $rentBillService
    ) {}

    public function getDashboardData(User $landlord): array
    {
        $propertyIds = $landlord->properties()->pluck('id');
        $unitIds = Unit::whereIn('property_id', $propertyIds)->pluck('id');
        $tenancyIds = Tenancy::whereIn('unit_id', $unitIds)->pluck('id');

        $properties = $this->getPropertiesWithCounts($landlord);
        $unitStats = $this->getUnitStats($unitIds);
        $paymentStats = $this->getPaymentStats($tenancyIds);
        $revenueMtd = $this->getRevenueMtd($tenancyIds);
        $recentPayments = $this->getRecentPayments($tenancyIds);
        $expiringLeases = $this->getExpiringLeases($tenancyIds);
        $rentStats = $this->rentBillService->getRentStatistics($landlord);

        return [
            'total_properties' => $properties->count(),
            'total_units' => $properties->sum('units_count'),
            'occupied_units' => $unitStats['occupied'],
            'vacant_units' => $unitStats['vacant'],
            'total_tenants' => $properties->sum('active_tenants_count'),
            'revenue_mtd' => (float) $revenueMtd,
            'pending_payments' => (int) $paymentStats['pending'],
            'overdue_payments' => (int) $paymentStats['overdue'],
            'pending_rent_bills' => (int) ($rentStats['pending'] ?? 0),
            'overdue_rent_bills' => (int) ($rentStats['overdue'] ?? 0),
            'total_rent_outstanding' => (float) ($rentStats['total_outstanding'] ?? 0),
            'recent_payments' => $recentPayments,
            'expiring_leases' => $expiringLeases,
            'properties' => $this->formatProperties($properties),
            'unread_notifications' => $landlord->unreadNotifications()->count(),
        ];
    }

    protected function getPropertiesWithCounts(User $landlord): Collection
    {
        return Property::where('owner_id', $landlord->id)
            ->withCount(['units'])
            ->withCount(['tenancies as active_tenants_count' => function ($query) {
                $query->where('tenancies.status', 'active');
            }])
            ->get();
    }

    protected function getUnitStats(Collection $unitIds): array
    {
        $occupiedUnits = Unit::whereIn('id', $unitIds)
            ->whereHas('tenancies', function ($query) {
                $query->where('tenancies.status', 'active');
            })
            ->count();

        return [
            'occupied' => $occupiedUnits,
            'vacant' => max(0, $unitIds->count() - $occupiedUnits),
        ];
    }

    protected function getPaymentStats(Collection $tenancyIds): array
    {
        $stats = Payment::whereIn('tenancy_id', $tenancyIds)
            ->selectRaw("
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
            ")
            ->first();

        return [
            'pending' => (int) ($stats?->pending_count ?? 0),
            'overdue' => (int) ($stats?->overdue_count ?? 0),
        ];
    }

    protected function getRevenueMtd(Collection $tenancyIds): float
    {
        return (float) Payment::whereIn('tenancy_id', $tenancyIds)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [now()->startOfMonth(), now()])
            ->sum('amount');
    }

    protected function getRecentPayments(Collection $tenancyIds): Collection
    {
        return Payment::whereIn('tenancy_id', $tenancyIds)
            ->with([
                'tenant:id,full_name,tenant_code',
                'tenancy.tenant:id,full_name,tenant_code',
                'tenancy.unit:id,unit_code,unit_name,property_id',
            ])
            ->orderByDesc('paid_at')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'paid_at' => $payment->paid_at?->toISOString(),
                    'status' => $payment->status,
                    'tenant_name' => $payment->tenant?->full_name,
                    'unit_code' => $payment->tenancy?->unit?->unit_code,
                    'tenancy' => [
                        'id' => $payment->tenancy_id,
                        'tenant' => $payment->tenant ? [
                            'id' => $payment->tenant->id,
                            'full_name' => $payment->tenant->full_name,
                            'tenant_code' => $payment->tenant->tenant_code,
                        ] : null,
                        'unit' => $payment->tenancy?->unit ? [
                            'id' => $payment->tenancy->unit->id,
                            'unit_code' => $payment->tenancy->unit->unit_code,
                        ] : null,
                    ],
                ];
            });
    }

    protected function getExpiringLeases(Collection $tenancyIds): Collection
    {
        return Tenancy::whereIn('id', $tenancyIds)
            ->where('status', 'active')
            ->whereNotNull('move_out_date')
            ->where('move_out_date', '<=', now()->addDays(30))
            ->with([
                'tenant:id,full_name,email,tenant_code',
                'unit:id,unit_name,property_id',
            ])
            ->orderBy('move_out_date')
            ->limit(5)
            ->get()
            ->map(function ($tenancy) {
                return [
                    'id' => $tenancy->id,
                    'status' => $tenancy->status,
                    'move_in_date' => $tenancy->move_in_date,
                    'move_out_date' => $tenancy->move_out_date,
                    'rent_amount' => $tenancy->monthly_rent,
                    'tenant' => $tenancy->tenant ? [
                        'id' => $tenancy->tenant->id,
                        'full_name' => $tenancy->tenant->full_name,
                        'email' => $tenancy->tenant->email,
                    ] : null,
                    'unit' => $tenancy->unit ? [
                        'id' => $tenancy->unit->id,
                        'unit_number' => $tenancy->unit->unit_name,
                    ] : null,
                ];
            });
    }

    protected function formatProperties(Collection $properties): Collection
    {
        return $properties->map(function ($property) {
            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'units_count' => $property->units_count,
                'active_tenancies_count' => $property->active_tenants_count,
            ];
        });
    }
}
