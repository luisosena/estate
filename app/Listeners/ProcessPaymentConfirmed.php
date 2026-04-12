<?php

namespace App\Listeners;

use App\Events\PaymentConfirmed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Services\RentBillService;
use App\Services\UtilityService;
use App\Services\NotificationService;
use App\Services\ReceiptService;
use App\Models\UtilityBill;
use Illuminate\Support\Facades\Log;

class ProcessPaymentConfirmed implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        protected RentBillService $rentBillService,
        protected UtilityService $utilityService,
        protected NotificationService $notificationService,
        protected ReceiptService $receiptService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(PaymentConfirmed $event): void
    {
        $payment = $event->payment;
        Log::info("Processing confirmed async payment {$payment->id}");

        // Mark as confirmed and set confirmed timestamp
        $payment->gateway_confirmed_at = now();
        $payment->save();

        if ($payment->payment_type === 'rent' && $payment->rent_bill_id) {
            try {
                $this->rentBillService->syncPaymentWithRentBill($payment);
                // Derive payment status from rent bill (source of truth)
                $rentBill = \App\Models\RentBill::find($payment->rent_bill_id);
                if ($rentBill) {
                    $payment->status = $rentBill->status; // 'paid' or 'partial'
                    $payment->save();
                }
                Log::info("Synced rent bill for payment {$payment->id}, status={$payment->status}");
            } catch (\Exception $e) {
                Log::error("Failed syncing rent bill for async payment {$payment->id}: " . $e->getMessage());
                // Fall back to marking paid since gateway confirmed it
                $payment->status = 'paid';
                $payment->save();
            }
        } elseif ($payment->payment_type === 'utility' && $payment->utility_bill_id) {
            try {
                $utilityBill = UtilityBill::find($payment->utility_bill_id);
                if ($utilityBill) {
                    $this->utilityService->processUtilityPayment($utilityBill, $payment->amount);
                    $utilityBill->refresh();
                    $payment->status = $utilityBill->status; // 'paid' or 'partial'
                    $payment->save();
                    Log::info("Synced utility bill for payment {$payment->id}, status={$payment->status}");
                }
            } catch (\Exception $e) {
                Log::error("Failed syncing utility bill for async payment {$payment->id}: " . $e->getMessage());
                $payment->status = 'paid';
                $payment->save();
            }
        } else {
            // No linked bill — gateway confirms full payment
            $payment->status = 'paid';
            $payment->save();
        }

        // Generate the receipt for the formally confirmed payment
        try {
            $this->receiptService->generate($payment);
            Log::info("Generated receipt for payment {$payment->id}");
        } catch (\Exception $e) {
            Log::error("Failed generating receipt for payment {$payment->id}: " . $e->getMessage());
        }

        // Notify the user via multi-channel notification abstraction
        if ($payment->tenant && $payment->tenant->user) {
            $this->notificationService->sendPaymentReceivedNotification($payment->tenant->user, $payment);
        }
    }
}
