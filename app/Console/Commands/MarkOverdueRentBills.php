<?php

namespace App\Console\Commands;

use App\Models\RentBill;
use App\Services\NotificationService;
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
    public function handle(NotificationService $notificationService): int
    {
        $this->info('Marking overdue rent bills...');

        try {
            $overdueBills = RentBill::whereIn('status', ['pending', 'partial'])
                ->where('due_date', '<', today())
                ->with(['tenancy.tenant.user'])
                ->get();

            $count = $overdueBills->count();

            if ($count > 0) {
                RentBill::whereIn('id', $overdueBills->pluck('id'))->update(['status' => 'overdue']);
            }

            $this->info("Marked {$count} rent bill(s) as overdue.");

            foreach ($overdueBills as $bill) {
                if ($bill->tenancy?->tenant?->user) {
                    try {
                        $notificationService->sendRentBillOverdueNotification($bill->tenancy->tenant->user, $bill);
                    } catch (\Exception $e) {
                        Log::error('Failed to send rent bill overdue notification', [
                            'bill_id' => $bill->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }

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
