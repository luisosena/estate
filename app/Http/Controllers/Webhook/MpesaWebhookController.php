<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Events\PaymentConfirmed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaWebhookController extends Controller
{
    /**
     * Handle the M-Pesa STK Push Callback.
     * We don't authenticate this endpoint strictly since M-Pesa IPs are varied,
     * but we should verify the structure of the callback and optionally a signature.
     */
    public function handleCallback(Request $request)
    {
        Log::info('M-Pesa Webhook Received', $request->all());

        $callbackData = $request->input('Body.stkCallback');

        if (!$callbackData) {
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Invalid data format'], 400);
        }

        $resultCode = $callbackData['ResultCode'] ?? null;
        $checkoutRequestId = $callbackData['CheckoutRequestID'] ?? null;

        if (!$checkoutRequestId) {
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Missing CheckoutRequestID'], 400);
        }

        $payment = Payment::where('checkout_request_id', $checkoutRequestId)->first();

        if (!$payment) {
            Log::warning("M-Pesa Webhook for unknown checkout_request_id: {$checkoutRequestId}");
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Not found but accepted'], 200);
        }

        if ($resultCode == 0) {
            // Success
            $payment->update([
                'gateway_status' => 'success',
                'gateway_metadata' => $callbackData,
            ]);

            // For STK Push, CallbackMetadata holds the actual transaction metadata
            $metadata = $callbackData['CallbackMetadata']['Item'] ?? [];
            $receiptNumber = null;
            foreach ($metadata as $item) {
                if ($item['Name'] === 'MpesaReceiptNumber') {
                    $receiptNumber = $item['Value'];
                    break;
                }
            }

            if ($receiptNumber) {
                $payment->update(['gateway_reference' => $receiptNumber]);
            }

            // We fire the PaymentConfirmed event so listeners handle rent bill completion etc
            PaymentConfirmed::dispatch($payment);

        } else {
            // Failed, cancelled, etc
            $payment->update([
                'status' => 'failed',
                'gateway_status' => 'failed',
                'gateway_metadata' => $callbackData,
            ]);
            
            // Revert rent bills, etc logic would go here if needed, or pending bills just remain pending
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted'], 200);
    }
}
