<?php

namespace App\Console\Commands;

use App\Services\ReceiptService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupOldReceipts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'receipts:cleanup {--days=90 : Delete receipts older than this many days}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete stored PDF receipts older than the retention window';

    public function handle(ReceiptService $receiptService): int
    {
        $days = (int) $this->option('days');
        $this->info("Cleaning up receipts older than {$days} days...");

        try {
            $count = $receiptService->cleanupOldReceipts($days);

            $this->info("Deleted {$count} receipt file(s).");
            Log::info("CleanupOldReceipts: deleted {$count} files", ['days' => $days]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Cleanup failed: '.$e->getMessage());
            Log::error('CleanupOldReceipts failed', ['error' => $e->getMessage()]);

            return Command::FAILURE;
        }
    }
}
