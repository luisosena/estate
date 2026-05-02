<?php

namespace App\Listeners;

use App\Events\PaymentConfirmed;
use App\Models\RentBill;
use App\Models\UtilityBill;
use App\Services\NotificationService;
use App\Services\ReceiptService;
use App\Services\RentBillService;
use App\Services\UtilityService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 *
 * This file is part of the payment gateway scaffold. It has been ported from
 * the `architectural-refactoring` branch but is NOT yet wired into the
 * application. No route, controller, or service provider references this file.
 *
 * To activate: follow docs/plans/porting-plan.md Phase 3 wiring steps.
 * To remove:   follow the teardown inventory in handoff_payment_scaffold.md.
 */
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
                $rentBill = RentBill::find($payment->rent_bill_id);
                if ($rentBill) {
                    $payment->status = $rentBill->status; // 'paid' or 'partial'
                    $payment->save();
                }
                Log::info("Synced rent bill for payment {$payment->id}, status={$payment->status}");
            } catch (\Exception $e) {
                Log::error("Failed syncing rent bill for async payment {$payment->id}: ".$e->getMessage());
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
                Log::error("Failed syncing utility bill for async payment {$payment->id}: ".$e->getMessage());
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
            Log::error("Failed generating receipt for payment {$payment->id}: ".$e->getMessage());
        }

        // Notify the user via multi-channel notification abstraction
        if ($payment->tenant && $payment->tenant->user) {
            $this->notificationService->sendPaymentReceivedNotification($payment->tenant->user, $payment);
        }
    }
}
