<?php

namespace App\Services;

use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReceiptService
{
    /**
     * Generate a PDF receipt for a payment and stream it directly.
     *
     * Loads all required relationships via loadMissing(), renders the
     * receipts.payment Blade view through DomPDF, and returns the PDF
     * as a downloadable response without storing on disk.
     *
     * @param  Payment  $payment  The payment model to generate a receipt for.
     * @return \Illuminate\Http\Response The PDF response with download headers.
     *
     * @throws \Exception When DomPDF rendering fails.
     */
    public function stream(Payment $payment): Response
    {
        // Load relationships needed for the receipt
        $payment->loadMissing(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill']);

        $pdf = Pdf::loadView('receipts.payment', compact('payment'));

        $filename = sprintf(
            'receipt-%s-%s.pdf',
            str_pad((string) $payment->id, 8, '0', STR_PAD_LEFT),
            now()->format('Y-m-d')
        );

        return new Response(
            $pdf->output(),
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]
        );
    }
}
