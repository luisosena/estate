<?php

namespace App\Console\Commands;

use App\Models\TenancyUtility;
use App\Models\UtilityBill;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateMonthlyUtilityBills extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'utility-bills:generate-monthly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly utility bills for all active tenancy utilities';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Generating monthly utility bills...');

        try {
            $billingMonth = today()->startOfMonth();
            $count = 0;

            $tenancyUtilities = TenancyUtility::active()
                ->whereHas('tenancy', fn ($q) => $q->where('tenancies.status', 'active'))
                ->with('utilityType')
                ->get();

            $totalCount = $tenancyUtilities->count();
            $progressBar = $this->output->createProgressBar($totalCount);
            $progressBar->start();

            foreach ($tenancyUtilities as $tu) {
                // Skip utilities with no valid amount
                if ($tu->amount === null || $tu->amount <= 0) {
                    $progressBar->advance();

                    continue;
                }

                $bill = UtilityBill::firstOrCreate(
                    [
                        'tenancy_utility_id' => $tu->id,
                        'billing_month' => $billingMonth,
                    ],
                    [
                        'amount_due' => $tu->amount,
                        'due_date' => today()->endOfMonth(),
                        'status' => 'pending',
                    ]
                );

                if ($bill->wasRecentlyCreated) {
                    $count++;
                    $utilityName = $tu->utilityType?->name ?? 'Unknown Utility';
                    $this->line("Created bill for {$utilityName} - Tenancy #{$tu->tenancy_id}");
                }

                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine();

            $this->info("Created {$count} new utility bill(s) for ".$billingMonth->format('F Y'));

            Log::info("GenerateMonthlyUtilityBills: Created {$count} utility bills for {$billingMonth->format('Y-m')}");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to generate utility bills: '.$e->getMessage());
            Log::error('GenerateMonthlyUtilityBills failed: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
