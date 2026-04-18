<?php

namespace App\Console\Commands;

use App\Models\RentBill;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MarkOverdueRentBills extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rent-bills:mark-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark pending and partial rent bills as overdue when their due date has passed';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Marking overdue rent bills...');

        try {
            $count = RentBill::whereIn('status', ['pending', 'partial'])
                ->where('due_date', '<', today())
                ->update(['status' => 'overdue']);

            $this->info("Marked {$count} rent bill(s) as overdue.");

            Log::info("MarkOverdueRentBills: Marked {$count} rent bills as overdue", [
                'count' => $count,
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to mark overdue rent bills: '.$e->getMessage());
            Log::error('MarkOverdueRentBills failed: '.$e->getMessage(), [
                'exception' => $e->getMessage(),
            ]);

            return Command::FAILURE;
        }
    }
}
