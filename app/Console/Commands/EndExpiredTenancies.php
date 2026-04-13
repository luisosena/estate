<?php

namespace App\Console\Commands;

use App\Models\Tenancy;
use App\Models\User;
use App\Notifications\TenancyEndedNotification;
use App\Notifications\TenancyExpiringNotification;
use App\Notifications\TenancyEndedWithBalance;
use App\Services\RentBillService;
use App\Services\UtilityService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class EndExpiredTenancies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenancy:end-expired {--dry-run : Show what would be done without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically end expired tenancies and send notifications';

    /**
     * Execute the console command.
     */
    public function handle(RentBillService $rentBillService, UtilityService $utilityService)
    {
        $this->info('Starting expired tenancy check...');
        
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
        }

        // Check for tenancies ending in 10 days
        $this->checkUpcomingExpirations(10, '10 days');

        // Check for tenancies ending in 3 days
        $this->checkUpcomingExpirations(3, '3 days');

        // Check for expired tenancies (move_out_date is today or in the past)
        $this->checkExpiredTenancies($dryRun, $rentBillService, $utilityService);

        $this->info('Expired tenancy check completed.');
    }

    /**
     * Check for upcoming expirations and send notifications.
     */
    private function checkUpcomingExpirations(int $days, string $period)
    {
        $targetDate = now()->addDays($days)->toDateString();
        
        $upcomingTenancies = Tenancy::with(['tenant', 'unit.property'])
            ->where('status', 'active')
            ->whereDate('move_out_date', $targetDate)
            ->get();

        if ($upcomingTenancies->isEmpty()) {
            $this->info("No tenancies ending in {$period}.");
            return;
        }

        $this->info("Found {$upcomingTenancies->count()} tenancy(ies) ending in {$period}:");

        foreach ($upcomingTenancies as $tenancy) {
            /** @var \App\Models\Tenancy $tenancy */
            $this->line("- {$tenancy->tenant->full_name} ({$tenancy->tenant->tenant_code}) - Unit: {$tenancy->unit->unit_name} - Ends: {$tenancy->move_out_date}");

            // Send notification to tenant
            try {
                $tenancy->tenant->notify(new TenancyExpiringNotification($tenancy, $days));
                $this->info("  ✓ Notification sent to tenant: {$tenancy->tenant->email}");
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to send notification to tenant: {$e->getMessage()}");
                Log::error('Failed to send expiration notification to tenant', [
                    'tenancy_id' => $tenancy->id,
                    'tenant_id' => $tenancy->tenant_id,
                    'error' => $e->getMessage()
                ]);
            }

            // Send notification to landlord
            try {
                $landlord = $tenancy->unit->property->owner;
                if ($landlord) {
                    $landlord->notify(new TenancyExpiringNotification($tenancy, $days, true));
                    $this->info("  ✓ Notification sent to landlord: {$landlord->email}");
                }
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to send notification to landlord: {$e->getMessage()}");
                Log::error('Failed to send expiration notification to landlord', [
                    'tenancy_id' => $tenancy->id,
                    'landlord_id' => $tenancy->unit->property->owner_id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Check for expired tenancies and end them automatically.
     */
    private function checkExpiredTenancies(bool $dryRun, RentBillService $rentBillService, UtilityService $utilityService)
    {
        $expiredTenancies = Tenancy::query()
            ->with(['tenant', 'unit.property'])
            ->where('status', 'active')
            ->whereDate('move_out_date', '<=', now()->toDateString())
            ->get();

        if ($expiredTenancies->isEmpty()) {
            $this->info('No expired tenancies found.');
            return;
        }

        $this->info("Found {$expiredTenancies->count()} expired tenancy(ies):");

        foreach ($expiredTenancies as $tenancy) {
            /** @var \App\Models\Tenancy $tenancy */
            $this->line("- {$tenancy->tenant->full_name} ({$tenancy->tenant->tenant_code}) - Unit: {$tenancy->unit->unit_name} - Expired: {$tenancy->move_out_date}");

            if ($dryRun) {
                $this->info("  [DRY RUN] Would end tenancy and update unit status");
                continue;
            }

            try {
                // End the tenancy
                $tenancy->update([
                    'status' => 'ended',
                    'end_reason' => 'automatic_expiry',
                    'deposit_return_status' => 'pending',
                    'final_meter_readings' => 'Automatically ended - no readings recorded',
                ]);

                // Update unit status to available
                $tenancy->unit->update(['status' => 'available']);

                $this->info("  ✓ Tenancy ended automatically");

                // Send notification to tenant
                try {
                    $tenancy->tenant->notify(new TenancyEndedNotification($tenancy, true));
                    $this->info("  ✓ End notification sent to tenant: {$tenancy->tenant->email}");
                } catch (\Exception $e) {
                    $this->error("  ✗ Failed to send end notification to tenant: {$e->getMessage()}");
                }

                // Send notification to landlord
                try {
                    $landlord = $tenancy->unit->property->owner;
                    if ($landlord) {
                        $landlord->notify(new TenancyEndedNotification($tenancy, false));
                        $this->info("  ✓ End notification sent to landlord: {$landlord->email}");
                        
                        // Check for outstanding balance and notify separately
                        $outstandingRent = $rentBillService->calculateTotalOutstanding($tenancy->id);
                        $utilitySummary = $utilityService->getBillsForTenant($tenancy->tenant);
                        $outstandingUtilities = $utilitySummary['outstanding'] ?? 0;
                        $totalOutstanding = $outstandingRent + $outstandingUtilities;

                        if ($totalOutstanding > 0) {
                            $landlord->notify(new TenancyEndedWithBalance($tenancy, $totalOutstanding));
                            $this->info("  ! Balance notification sent to landlord: " . number_format($totalOutstanding, 2) . " TZS");
                        }
                    }
                } catch (\Exception $e) {
                    $this->error("  ✗ Failed to send end notification to landlord: {$e->getMessage()}");
                }

                Log::info('Tenancy automatically ended', [
                    'tenancy_id' => $tenancy->id,
                    'tenant_id' => $tenancy->tenant_id,
                    'unit_id' => $tenancy->unit_id,
                    'move_out_date' => $tenancy->move_out_date,
                    'ended_at' => now()->toDateTimeString()
                ]);

            } catch (\Exception $e) {
                $this->error("  ✗ Failed to end tenancy: {$e->getMessage()}");
                Log::error('Failed to automatically end tenancy', [
                    'tenancy_id' => $tenancy->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}
