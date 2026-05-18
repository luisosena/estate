<?php

namespace App\Services\Admin;

use App\Http\Resources\ActivityResource;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;

class AdminDashboardService
{
    public function getDashboardData(): array
    {
        return [
            'stats' => $this->getGlobalStats(),
            'activity' => $this->getRecentActivity(),
        ];
    }

    protected function getGlobalStats(): array
    {
        $propertyStats = Property::selectRaw("
            COUNT(*) as total_properties,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_properties
        ")->first();

        $landlordStats = User::where('role', 'landlord')
            ->selectRaw("
                COUNT(*) as total_landlords,
                SUM(CASE WHEN email_verified_at IS NULL THEN 1 ELSE 0 END) as pending_landlords
            ")->first();

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
}
