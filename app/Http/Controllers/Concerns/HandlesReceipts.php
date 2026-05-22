<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\ReceiptService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

trait HandlesReceipts
{
    /**
     * Stream a PDF receipt response for a given payment.
     *
     * @param  Payment  $payment  Already ownership-checked by the caller.
     * @param  ReceiptService  $receiptService  Injected by the calling controller method.
     */
    protected function buildReceiptResponse(Payment $payment, ReceiptService $receiptService): Response
    {
        if (! in_array($payment->status, [PaymentStatus::Paid, PaymentStatus::Partial])) {
            abort(400, 'Receipt not available for unpaid payments.');
        }

        try {
            return $receiptService->stream($payment);
        } catch (\Exception $e) {
            Log::error('Receipt generation failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Unable to generate receipt. Please try again.');
        }
    }
}
