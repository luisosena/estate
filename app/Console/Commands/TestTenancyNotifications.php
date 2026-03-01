<?php

namespace App\Console\Commands;

use App\Models\Tenancy;
use App\Notifications\TenancyExpiringNotification;
use App\Notifications\TenancyEndedNotification;
use Illuminate\Console\Command;

class TestTenancyNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenancy:test-notifications {tenancy_id} {type=expiring}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test tenancy notifications (for development/testing)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenancyId = $this->argument('tenancy_id');
        $type = $this->argument('type');

        $tenancy = Tenancy::with(['tenant', 'unit.property'])->find($tenancyId);

        if (!$tenancy) {
            $this->error("Tenancy with ID {$tenancyId} not found.");
            return 1;
        }

        $this->info("Testing {$type} notification for tenancy {$tenancyId}:");
        $this->line("Tenant: {$tenancy->tenant->full_name} ({$tenancy->tenant->tenant_code})");
        $this->line("Property: {$tenancy->unit->property->name}");
        $this->line("Unit: {$tenancy->unit->unit_name}");
        $this->line("End Date: {$tenancy->move_out_date}");

        try {
            if ($type === 'expiring') {
                $days = 10; // Test with 10 days
                $tenancy->tenant->notify(new TenancyExpiringNotification($tenancy, $days));
                $this->info("✓ Expiring notification sent to tenant");
            } elseif ($type === 'ended') {
                $tenancy->tenant->notify(new TenancyEndedNotification($tenancy, true));
                $this->info("✓ Ended notification sent to tenant");
            }
        } catch (\Exception $e) {
            $this->error("✗ Failed to send notification: {$e->getMessage()}");
            return 1;
        }

        $this->info("Test completed successfully!");
        return 0;
    }
}
