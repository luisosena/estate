<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Collection;

class TenantService
{
    public function getTenantDashboardData(Tenant $tenant): array
    {
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'payments', 'utilities'])
            ->first();

        return [
            'tenant' => [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'phone' => $tenant->phone,
                'email' => $tenant->email,
            ],
            'unit' => $activeTenancy?->unit,
            'tenancy' => $activeTenancy ? [
                'move_in_date' => $activeTenancy->move_in_date,
                'status' => $activeTenancy->status,
            ] : null,
            'payments' => $activeTenancy?->payments
                ->sortByDesc(function ($payment) {
                    return $payment->paid_at ?? $payment->created_at;
                })
                ->take(5)
                ->values() ?? [],
            'utilities' => $activeTenancy?->utilities,
            'notifications' => $tenant->notifications()
                ->latest()
                ->take(5)
                ->get(),
        ];
    }

    public function getActiveTenancy(Tenant $tenant): ?Tenancy
    {
        return $tenant->tenancies()
            ->where('status', 'active')
            ->with(['unit', 'payments', 'utilities'])
            ->first();
    }
}
