<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Payment;
use App\Services\ReceiptService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

trait HandlesReceipts
{
    /**
     * Stream the PDF receipt for a given payment directly to the browser.
     *
     * Receipts are generated on-demand and never stored on disk.
     *
     * @param  Payment  $payment  Already ownership-checked by the caller.
     * @param  ReceiptService  $receiptService  Injected by the calling controller method.
     * @return \Illuminate\Http\Response The PDF download response.
     */
    protected function buildReceiptResponse(Payment $payment, ReceiptService $receiptService): Response
    {
        if (! in_array($payment->status, ['paid', 'partial'])) {
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
