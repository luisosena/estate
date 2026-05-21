<?php

namespace App\Console\Commands;

use App\Models\RentBill;
use App\Models\Tenancy;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateMonthlyRentBills extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rent-bills:generate-monthly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly rent bills for all active tenancies';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService): int
    {
        $this->info('Generating monthly rent bills...');

        try {
            $billingMonth = today()->startOfMonth();
            $count = 0;

            $tenancies = Tenancy::where('status', 'active')
                ->where('monthly_rent', '>', 0)
                ->with(['unit', 'tenant'])
                ->get();

            $totalCount = $tenancies->count();
            $progressBar = $this->output->createProgressBar($totalCount);
            $progressBar->start();

            foreach ($tenancies as $tenancy) {
                try {
                    // Skip tenancies with no valid rent amount
                    if ($tenancy->monthly_rent === null || $tenancy->monthly_rent <= 0) {
                        Log::debug('GenerateMonthlyRentBills: Skipped tenancy - no valid rent', [
                            'tenancy_id' => $tenancy->id,
                            'monthly_rent' => $tenancy->monthly_rent,
                        ]);
                        $progressBar->advance();

                        continue;
                    }

                    // Calculate due date (default: 5th of the month)
                    $dueDate = $billingMonth->copy()->day(5);

                    $bill = RentBill::firstOrCreate(
                        [
                            'tenancy_id' => $tenancy->id,
                            'billing_month' => $billingMonth,
                        ],
                        [
                            'amount_due' => $tenancy->monthly_rent,
                            'due_date' => $dueDate,
                            'status' => 'pending',
                        ]
                    );

                    if ($bill->wasRecentlyCreated) {
                        $count++;
                        $tenantName = $tenancy->tenant?->full_name ?? 'Unknown Tenant';
                        $unitCode = $tenancy->unit?->unit_code ?? 'Unknown Unit';
                        $this->line("Created rent bill for {$tenantName} - Unit {$unitCode}");

                        if ($tenancy->tenant?->user) {
                            try {
                                $notificationService->sendRentBillGeneratedNotification($tenancy->tenant->user, $bill);
                            } catch (\Exception $e) {
                                Log::error('Failed to send rent bill generated notification', [
                                    'bill_id' => $bill->id,
                                    'error' => $e->getMessage(),
                                ]);
                            }
                        }
                    }
                } catch (\Exception $e) {
                    $this->error("  ✗ Failed to generate bill for tenancy #{$tenancy->id}: {$e->getMessage()}");
                    Log::error('GenerateMonthlyRentBills: Failed for tenancy', [
                        'tenancy_id' => $tenancy->id,
                        'error' => $e->getMessage(),
                    ]);
                } finally {
                    $progressBar->advance();
                }
            }

            $progressBar->finish();
            $this->newLine();

            $this->info("Created {$count} new rent bill(s) for ".$billingMonth->format('F Y'));

            Log::info("GenerateMonthlyRentBills: Created {$count} rent bills for {$billingMonth->format('Y-m')}", [
                'billing_month' => $billingMonth->toDateString(),
                'count' => $count,
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to generate rent bills: '.$e->getMessage());
            Log::error('GenerateMonthlyRentBills failed: '.$e->getMessage(), [
                'exception' => $e->getMessage(),
            ]);

            return Command::FAILURE;
        }
    }
}
