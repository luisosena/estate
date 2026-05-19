<?php

namespace App\Services\Admin;

use App\Http\Resources\ActivityResource;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Collection;

class AdminDashboardService
{
    public function getDashboardData(): array
    {
        return [
            'stats' => $this->getGlobalStats(),
            'activity' => $this->getRecentActivity(),
        ];
    }

    public function getAuditReportData(): array
    {
        return [
            'recentLandlords' => $this->getRecentLandlords(),
            'recentProperties' => $this->getRecentProperties(),
            'recentTenancies' => $this->getRecentTenancies(),
            'recentPayments' => $this->getRecentPayments(),
        ];
    }

    protected function getGlobalStats(): array
    {
        $propertyStats = Property::selectRaw("
            COUNT(*) as total_properties,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_properties
        ")->first();

        $landlordStats = User::where('role', 'landlord')
            ->selectRaw('
                COUNT(*) as total_landlords,
                SUM(CASE WHEN email_verified_at IS NULL THEN 1 ELSE 0 END) as pending_landlords
            ')->first();

        return [
            'total_properties' => (int) ($propertyStats?->total_properties ?? 0),
            'total_units' => Unit::count(),
            'active_tenancies' => Tenancy::active()->count(),
            'total_landlords' => (int) ($landlordStats?->total_landlords ?? 0),
            'pending_landlords' => (int) ($landlordStats?->pending_landlords ?? 0),
            'maintenance_properties' => (int) ($propertyStats?->maintenance_properties ?? 0),
        ];
    }

    protected function getRecentActivity(): array
    {
        $recentLandlords = User::where('role', 'landlord')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentProperties = Property::with('landlord')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $activity = $recentLandlords->concat($recentProperties)
            ->sortByDesc('created_at')
            ->take(8)
            ->values();

        return ActivityResource::collection($activity)->resolve();
    }

    protected function getRecentLandlords(): Collection
    {
        return User::where('role', 'landlord')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at']);
    }

    protected function getRecentProperties(): Collection
    {
        return Property::with('landlord:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'name', 'address', 'status', 'owner_id', 'created_at']);
    }

    protected function getRecentTenancies(): Collection
    {
        return Tenancy::with(['tenant:id,full_name', 'unit:id,unit_code'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'tenant_id', 'unit_id', 'status', 'monthly_rent', 'created_at']);
    }

    protected function getRecentPayments(): Collection
    {
        return Payment::with(['tenant:id,full_name', 'tenancy.unit:id,unit_code'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'tenant_id', 'tenancy_id', 'amount', 'status', 'payment_type', 'created_at']);
    }
}
