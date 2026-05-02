<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Payment;
use App\Services\ReceiptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

trait HandlesReceipts
{
    /**
     * Build the JSON receipt response for a given payment.
     *
     * @param  Payment  $payment  Already ownership-checked by the caller.
     * @param  ReceiptService  $receiptService  Injected by the calling controller method.
     */
    protected function buildReceiptResponse(Payment $payment, ReceiptService $receiptService): JsonResponse
    {
        if (! $payment->receipt_path) {
            if (! in_array($payment->status, ['paid', 'partial'])) {
                return response()->json(['message' => 'Receipt not available for unpaid payments.'], 400);
            }

            try {
                $receiptService->generate($payment);
                $payment->refresh();
            } catch (\Exception $e) {
                Log::error('Receipt generation failed', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                return response()->json(['message' => 'Failed to generate receipt.'], 500);
            }
        }

        $url = $receiptService->getUrl($payment);

        if (! $url) {
            return response()->json(['message' => 'Unable to retrieve receipt url.'], 500);
        }

        return response()->json(['data' => ['url' => $url]]);
    }
}
