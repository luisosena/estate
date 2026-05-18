<?php

namespace App\Services\Landlord;

use App\Models\Payment;
use App\Models\RentBill;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RevenueAnalyticsService
{
    public function getMonthlyRevenueTrend(User $landlord, int $months = 12): Collection
    {
        $propertyIds = $landlord->properties()->pluck('id');
        $unitIds = Unit::whereIn('property_id', $propertyIds)->pluck('id');
        $tenancyIds = Tenancy::whereIn('unit_id', $unitIds)->pluck('id');

        if ($tenancyIds->isEmpty()) {
            return $this->emptyTrend($months);
        }

        $payments = Payment::whereIn('tenancy_id', $tenancyIds)
            ->where('status', 'paid')
            ->where('paid_at', '>=', now()->subMonths($months)->startOfMonth())
            ->get(['amount', 'paid_at']);

        $grouped = $payments->groupBy(fn ($p) => Carbon::parse($p->paid_at)->format('Y-m'))
            ->map(fn ($items, $month) => [
                'month' => $month,
                'label' => Carbon::parse($month.'-01')->format('M Y'),
                'total_revenue' => (float) $items->sum('amount'),
                'payment_count' => $items->count(),
            ]);

        return $this->fillMissingMonths($grouped, $months);
    }

    public function getPaymentCollectionTrend(User $landlord, int $months = 12): Collection
    {
        $propertyIds = $landlord->properties()->pluck('id');
        $unitIds = Unit::whereIn('property_id', $propertyIds)->pluck('id');
        $tenancyIds = Tenancy::whereIn('unit_id', $unitIds)->pluck('id');

        if ($tenancyIds->isEmpty()) {
            return $this->emptyCollectionTrend($months);
        }

        $bills = RentBill::whereIn('tenancy_id', $tenancyIds)
            ->where('billing_month', '>=', now()->subMonths($months)->startOfMonth())
            ->get(['status', 'billing_month']);

        $grouped = $bills->groupBy(fn ($b) => Carbon::parse($b->billing_month)->format('Y-m'))
            ->map(fn ($items, $month) => [
                'month' => $month,
                'label' => Carbon::parse($month.'-01')->format('M Y'),
                'paid' => $items->where('status', 'paid')->count(),
                'pending' => $items->where('status', 'pending')->count(),
                'overdue' => $items->where('status', 'overdue')->count(),
                'partial' => $items->where('status', 'partial')->count(),
                'waived' => $items->where('status', 'waived')->count(),
                'total' => $items->count(),
            ]);

        return $this->fillMissingCollectionMonths($grouped, $months);
    }

    public function getSystemRevenueTrend(int $months = 12): Collection
    {
        $payments = Payment::where('status', 'paid')
            ->where('paid_at', '>=', now()->subMonths($months)->startOfMonth())
            ->get(['amount', 'paid_at']);

        $grouped = $payments->groupBy(fn ($p) => Carbon::parse($p->paid_at)->format('Y-m'))
            ->map(fn ($items, $month) => [
                'month' => $month,
                'label' => Carbon::parse($month.'-01')->format('M Y'),
                'total_revenue' => (float) $items->sum('amount'),
                'payment_count' => $items->count(),
            ]);

        return $this->fillMissingMonths($grouped, $months);
    }

    protected function emptyTrend(int $months): Collection
    {
        $result = collect();
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $result->push([
                'month' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
                'total_revenue' => 0,
                'payment_count' => 0,
            ]);
        }

        return $result;
    }

    protected function emptyCollectionTrend(int $months): Collection
    {
        $result = collect();
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $result->push([
                'month' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
                'paid' => 0,
                'pending' => 0,
                'overdue' => 0,
                'partial' => 0,
                'waived' => 0,
                'total' => 0,
            ]);
        }

        return $result;
    }

    protected function fillMissingMonths(Collection $grouped, int $months): Collection
    {
        $result = collect();

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $existing = $grouped->get($key);

            $result->push([
                'month' => $key,
                'label' => $date->format('M Y'),
                'total_revenue' => (float) ($existing['total_revenue'] ?? 0),
                'payment_count' => (int) ($existing['payment_count'] ?? 0),
            ]);
        }

        return $result;
    }

    protected function fillMissingCollectionMonths(Collection $grouped, int $months): Collection
    {
        $result = collect();

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $existing = $grouped->get($key);

            $result->push([
                'month' => $key,
                'label' => $date->format('M Y'),
                'paid' => (int) ($existing['paid'] ?? 0),
                'pending' => (int) ($existing['pending'] ?? 0),
                'overdue' => (int) ($existing['overdue'] ?? 0),
                'partial' => (int) ($existing['partial'] ?? 0),
                'waived' => (int) ($existing['waived'] ?? 0),
                'total' => (int) ($existing['total'] ?? 0),
            ]);
        }

        return $result;
    }
}
