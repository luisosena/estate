<?php

namespace App\Services\Landlord;

use App\Models\Payment;
use App\Models\RentBill;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RevenueAnalyticsService
{
    public function getMonthlyRevenueTrend(User $landlord, int $months = 12): Collection
    {
        $tenancyIds = $landlord->getTenancyIds();

        if ($tenancyIds->isEmpty()) {
            return $this->emptyTrend($months);
        }

        $payments = Payment::whereIn('tenancy_id', $tenancyIds)
            ->where('status', 'paid')
            ->where('paid_at', '>=', now()->subMonths($months)->startOfMonth())
            ->selectRaw($this->dateGroupSelect('paid_at', 'SUM(amount) as total_revenue, COUNT(*) as payment_count'))
            ->groupByRaw($this->dateGroupBy('paid_at'))
            ->get()
            ->keyBy('month');

        return $this->fillMissingMonths($payments, $months);
    }

    public function getPaymentCollectionTrend(User $landlord, int $months = 12): Collection
    {
        $tenancyIds = $landlord->getTenancyIds();

        if ($tenancyIds->isEmpty()) {
            return $this->emptyCollectionTrend($months);
        }

        $bills = RentBill::whereIn('tenancy_id', $tenancyIds)
            ->where('billing_month', '>=', now()->subMonths($months)->startOfMonth())
            ->selectRaw($this->dateGroupSelect('billing_month', "
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
                SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial,
                SUM(CASE WHEN status = 'waived' THEN 1 ELSE 0 END) as waived,
                COUNT(*) as total"))
            ->groupByRaw($this->dateGroupBy('billing_month'))
            ->get()
            ->keyBy('month');

        return $this->fillMissingCollectionMonths($bills, $months);
    }

    public function getSystemRevenueTrend(int $months = 12): Collection
    {
        $payments = Payment::where('status', 'paid')
            ->where('paid_at', '>=', now()->subMonths($months)->startOfMonth())
            ->selectRaw($this->dateGroupSelect('paid_at', 'SUM(amount) as total_revenue, COUNT(*) as payment_count'))
            ->groupByRaw($this->dateGroupBy('paid_at'))
            ->get()
            ->keyBy('month');

        return $this->fillMissingMonths($payments, $months);
    }

    protected function dateGroupSelect(string $column, string $aggregates): string
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return "strftime('%Y-%m', {$column}) as month, {$aggregates}";
        }

        return "DATE_FORMAT({$column}, '%Y-%m') as month, {$aggregates}";
    }

    protected function dateGroupBy(string $column): string
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return "strftime('%Y-%m', {$column})";
        }

        return "DATE_FORMAT({$column}, '%Y-%m')";
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

    protected function fillMissingMonths(Collection $dbResults, int $months): Collection
    {
        $result = collect();

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $existing = $dbResults->get($key);

            $result->push([
                'month' => $key,
                'label' => $date->format('M Y'),
                'total_revenue' => (float) ($existing?->total_revenue ?? 0),
                'payment_count' => (int) ($existing?->payment_count ?? 0),
            ]);
        }

        return $result;
    }

    protected function fillMissingCollectionMonths(Collection $dbResults, int $months): Collection
    {
        $result = collect();

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $existing = $dbResults->get($key);

            $result->push([
                'month' => $key,
                'label' => $date->format('M Y'),
                'paid' => (int) ($existing?->paid ?? 0),
                'pending' => (int) ($existing?->pending ?? 0),
                'overdue' => (int) ($existing?->overdue ?? 0),
                'partial' => (int) ($existing?->partial ?? 0),
                'waived' => (int) ($existing?->waived ?? 0),
                'total' => (int) ($existing?->total ?? 0),
            ]);
        }

        return $result;
    }
}
