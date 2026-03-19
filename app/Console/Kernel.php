<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Daily at 2 AM - Check for expired tenancies and send expiration notifications
        $schedule->command('tenancy:end-expired')
            ->daily()
            ->at('02:00')
            ->withoutOverlapping()
            ->description('End expired tenancies and send expiration notifications');

        // Daily at 00:00 - Mark pending and partial utility bills as overdue
        $schedule->command('utility-bills:mark-overdue')
            ->daily()
            ->withoutOverlapping()
            ->description('Mark pending and partial utility bills as overdue when due date passes');

        // Monthly on the 1st at 00:01 - Generate monthly utility bills for all active tenancy utilities
        $schedule->command('utility-bills:generate-monthly')
            ->monthlyOn(1, '00:01')
            ->withoutOverlapping()
            ->description('Generate monthly utility bills for active tenancy utilities');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
