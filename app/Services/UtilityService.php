<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\UtilityBill;
use App\Models\UtilityType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UtilityService
{
    /**
     * Assign a utility type to a tenancy.
     */
    public function assignUtilityToTenancy(Tenancy $tenancy, array $data): TenancyUtility
    {
        return DB::transaction(function () use ($tenancy, $data) {
            $tenancyUtility = TenancyUtility::create([
                'tenancy_id' => $tenancy->id,
                'utility_type_id' => $data['utility_type_id'],
                'amount' => $data['amount'],
                'billing_cycle' => $data['billing_cycle'] ?? 'monthly',
                'provider' => $data['provider'] ?? null,
                'account_number' => $data['account_number'] ?? null,
                'meter_number' => $data['meter_number'] ?? null,
                'status' => $data['status'] ?? 'active',
                'notes' => $data['notes'] ?? null,
            ]);

            return $tenancyUtility;
        });
    }

    /**
     * Remove a utility from a tenancy.
     */
    public function removeUtilityFromTenancy(TenancyUtility $tenancyUtility): bool
    {
        // Check for unpaid bills
        $unpaidBills = $tenancyUtility->bills()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->exists();

        if ($unpaidBills) {
            throw new \RuntimeException(
                'Cannot remove utility with unpaid bills. Please resolve outstanding bills first.'
            );
        }

        return $tenancyUtility->delete();
    }

    /**
     * Get all pending bills for a tenant.
     */
    public function getPendingBillsForTenant(Tenant $tenant): Collection
    {
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
            return collect();
        }

        return UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
                $q->where('tenancy_id', $activeTenancy->id);
            })
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->with(['tenancyUtility.utilityType'])
            ->orderBy('due_date', 'asc')
            ->get();
    }

    /**
     * Calculate total monthly utilities for a tenancy.
     */
    public function calculateTotalMonthlyUtilities(Tenancy $tenancy): float
    {
        return $tenancy->tenancyUtilities()
            ->active()
            ->where('billing_cycle', 'monthly')
            ->sum('amount');
    }

    /**
     * Get utilities summary for a tenancy.
     */
    public function getUtilitiesSummary(Tenancy $tenancy): array
    {
        $utilities = $tenancy->tenancyUtilities()
            ->with('utilityType')
            ->get();

        $monthlyTotal = $utilities
            ->where('billing_cycle', 'monthly')
            ->sum('amount');

        $quarterlyTotal = $utilities
            ->where('billing_cycle', 'quarterly')
            ->sum('amount') / 3;

        $annualTotal = $utilities
            ->where('billing_cycle', 'annual')
            ->sum('amount') / 12;

        $totalMonthly = $monthlyTotal + $quarterlyTotal + $annualTotal;

        return [
            'utilities' => $utilities,
            'monthly_total' => $monthlyTotal,
            'quarterly_total' => $quarterlyTotal,
            'annual_total' => $annualTotal,
            'total_monthly' => $totalMonthly,
            'count' => $utilities->count(),
            'active_count' => $utilities->where('status', 'active')->count(),
        ];
    }

    /**
     * Get all utility bills for a tenant with pagination.
     */
    public function getBillsForTenant(Tenant $tenant, array $filters = []): array
    {
        $activeTenancy = $tenant->tenancies()
            ->where('status', 'active')
            ->first();

        if (!$activeTenancy) {
            return [
                'bills' => collect(),
                'total' => 0,
                'pending' => 0,
                'paid' => 0,
                'overdue' => 0,
            ];
        }

        $query = UtilityBill::whereHas('tenancyUtility', function ($q) use ($activeTenancy) {
                $q->where('tenancy_id', $activeTenancy->id);
            })
            ->with(['tenancyUtility.utilityType']);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['billing_month'])) {
            $query->where('billing_month', $filters['billing_month']);
        }

        $bills = $query->orderBy('billing_month', 'desc')
            ->orderBy('due_date', 'asc')
            ->get();

        return [
            'bills' => $bills,
            'total' => $bills->sum('amount_due'),
            'pending' => $bills->where('status', 'pending')->sum('amount_due'),
            'paid' => $bills->where('status', 'paid')->sum('amount_due'),
            'overdue' => $bills->whereIn('status', ['overdue', 'partial'])->sum('amount_due'),
            'outstanding' => $bills->sum(function ($bill) {
                return $bill->amount_due - $bill->amount_paid;
            }),
        ];
    }

    /**
     * Process a utility payment and update the bill status.
     * 
     * @throws \InvalidArgumentException If payment amount exceeds outstanding balance
     */
    public function processUtilityPayment(UtilityBill $bill, float $amount): void
    {
        DB::transaction(function () use ($bill, $amount) {
            // Use the model's built-in reconciliation logic
            $bill->markPaid((float)$amount);
            
            return $bill;
        });
    }
}
