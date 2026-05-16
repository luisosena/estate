<?php

namespace App\Services;

use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReceiptService
{
    /**
     * Generate a PDF receipt on demand and stream it to the browser.
     *
     * No file is written to disk. The PDF is rendered in memory via DomPDF
     * and returned as a binary HTTP response with appropriate PDF headers.
     */
    public function stream(Payment $payment): Response
    {
        $payment->loadMissing(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill']);

        $pdf = Pdf::loadView('receipts.payment', compact('payment'));

        $filename = sprintf(
            'receipt-%s-%s.pdf',
            str_pad((string) $payment->id, 8, '0', STR_PAD_LEFT),
            now()->format('Y-m-d')
        );

        return new Response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
