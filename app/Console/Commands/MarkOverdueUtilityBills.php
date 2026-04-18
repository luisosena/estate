<?php

namespace App\Console\Commands;

use App\Models\UtilityBill;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MarkOverdueUtilityBills extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'utility-bills:mark-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark pending and partial utility bills as overdue when their due date has passed';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Marking overdue utility bills...');

        try {
            $count = UtilityBill::whereIn('status', ['pending', 'partial'])
                ->where('due_date', '<', today())
                ->update(['status' => 'overdue']);

            $this->info("Marked {$count} utility bill(s) as overdue.");

            Log::info("MarkOverdueUtilityBills: Marked {$count} utility bills as overdue");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to mark overdue bills: '.$e->getMessage());
            Log::error('MarkOverdueUtilityBills failed: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
