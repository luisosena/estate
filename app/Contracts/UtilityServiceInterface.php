<?php

namespace App\Contracts;

use App\Models\Tenancy;
use App\Models\TenancyUtility;
use App\Models\Tenant;
use App\Models\UtilityBill;
use Illuminate\Database\Eloquent\Collection;

interface UtilityServiceInterface
{
    /**
     * Assign a utility type to a tenancy.
     */
    public function assignUtilityToTenancy(Tenancy $tenancy, array $data): TenancyUtility;

    /**
     * Remove a utility from a tenancy.
     */
    public function removeUtilityFromTenancy(TenancyUtility $tenancyUtility): bool;

    /**
     * Get all pending bills for a tenant.
     */
    public function getPendingBillsForTenant(Tenant $tenant): Collection;

    /**
     * Calculate total monthly utilities for a tenancy.
     */
    public function calculateTotalMonthlyUtilities(Tenancy $tenancy): float;

    /**
     * Get utilities summary for a tenancy.
     */
    public function getUtilitiesSummary(Tenancy $tenancy): array;

    /**
     * Get all utility bills for a tenant with pagination.
     */
    public function getBillsForTenant(Tenant $tenant, array $filters = []): array;

    /**
     * Process a utility payment and update the bill status.
     */
    public function processUtilityPayment(UtilityBill $bill, float $amount): void;
}
