<?php

namespace App\Services\Admin;

use App\Http\Resources\ActivityResource;
use App\Models\Property;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminDashboardService
{
    /**
     * Get consolidated data for the admin dashboard.
     */
    public function getDashboardData(): array
    {
        return [
            'stats' => $this->getGlobalStats(),
            'activity' => $this->getRecentActivity(),
        ];
    }

    /**
     * Get global statistics.
     */
    protected function getGlobalStats(): array
    {
        return [
            'total_properties' => Property::count(),
            'total_units' => Unit::count(),
            'active_tenancies' => Tenancy::active()->count(),
            'total_landlords' => User::where('role', 'landlord')->count(),
            'pending_landlords' => User::where('role', 'landlord')->whereNull('email_verified_at')->count(),
            'maintenance_properties' => Property::where('status', 'maintenance')->count(),
        ];
    }

    /**
     * Get recent activity feed.
     */
    protected function getRecentActivity(): AnonymousResourceCollection
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

        return ActivityResource::collection($activity);
    }
}
