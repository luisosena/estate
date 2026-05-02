<?php

namespace App\Services;

use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ReceiptService
{
    /**
     * Generate a PDF receipt for a payment and store it.
     *
     * @return string The relative path to the receipt
     */
    public function generate(Payment $payment): string
    {
        // Load relationships needed for the receipt
        $payment->loadMissing(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill']);

        $pdf = Pdf::loadView('receipts.payment', compact('payment'));

        // Determine storage driver based on configuration. Fallback to local
        $disk = config('filesystems.default', 'local');

        $path = "receipts/{$payment->id}-".now()->format('Ymd').'.pdf';
        Storage::disk($disk)->put($path, $pdf->output());

        // Update the payment record with the receipt path
        $payment->update(['receipt_path' => $path]);

        return $path;
    }

    /**
     * Get a signed URL or local URL for the receipt.
     */
    public function getUrl(Payment $payment): ?string
    {
        if (! $payment->receipt_path) {
            return null;
        }

        $disk = config('filesystems.default', 'local');

        if ($disk === 'local' || $disk === 'public') {
            return Storage::disk($disk)->url($payment->receipt_path);
        }

        // For S3 or other cloud disks, return a signed URL valid for 30 minutes
        return Storage::disk($disk)->temporaryUrl(
            $payment->receipt_path,
            now()->addMinutes(30)
        );
    }
}
