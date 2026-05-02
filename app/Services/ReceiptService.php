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
     * Loads all required relationships via loadMissing(), renders the
     * receipts.payment Blade view through DomPDF, persists the file to the
     * configured storage disk, and writes the path back to the payment record.
     *
     * @param  Payment  $payment  The payment model to generate a receipt for.
     * @return string The relative storage path of the stored PDF.
     *
     * @throws \Exception When DomPDF rendering or storage write fails.
     */
    public function generate(Payment $payment): string
    {
        // Load relationships needed for the receipt
        $payment->loadMissing(['tenant', 'tenancy.unit.property', 'rentBill', 'utilityBill']);

        $pdf = Pdf::loadView('receipts.payment', compact('payment'));

        // Determine storage driver based on configuration. Fallback to local
        $disk = config('filesystems.default', 'local');

        $path = 'receipts/'.$payment->id.'-'.now()->format('Ymd-His').'-'.uniqid().'.pdf';
        Storage::disk($disk)->put($path, $pdf->output());

        // Update the payment record with the receipt path
        $payment->update(['receipt_path' => $path]);

        return $path;
    }

    /**
     * Dispatch PDF generation to a background queue.
     *
     * Use this when the caller does NOT need an immediate URL (e.g., batch
     * post-payment hooks). The receipt_path will be populated asynchronously.
     *
     * @param  string  $queue  Queue name; defaults to 'receipts'.
     */
    public function generateAsync(Payment $payment, string $queue = 'receipts'): void
    {
        dispatch(function () use ($payment) {
            $this->generate($payment);
        })->onQueue($queue);
    }

    /**
     * Delete receipt files older than the given retention window.
     *
     * Iterates all files under the 'receipts/' prefix on the default disk and
     * removes any whose last-modified timestamp predates the cutoff.
     *
     * @param  int  $days  Retention window in days. Defaults to 90.
     * @return int Number of files deleted.
     */
    public function cleanupOldReceipts(int $days = 90): int
    {
        $disk = config('filesystems.default', 'local');
        $cutoff = now()->subDays($days)->timestamp;
        $deleted = 0;

        foreach (Storage::disk($disk)->files('receipts') as $file) {
            if (Storage::disk($disk)->lastModified($file) < $cutoff) {
                Storage::disk($disk)->delete($file);
                $deleted++;
            }
        }

        return $deleted;
    }

    /**
     * Resolve a publicly accessible URL for a stored receipt.
     *
     * Returns a local URL for 'local'/'public' disks, or a signed temporary
     * URL valid for 30 minutes for cloud disks such as S3.
     *
     * @param  Payment  $payment  The payment whose receipt path to resolve.
     * @return string|null URL string, or null if no receipt exists yet.
     */
    public function getUrl(Payment $payment): ?string
    {
        if (! $payment->receipt_path) {
            return null;
        }

        $disk = config('filesystems.default', 'local');
        $cacheKey = "receipt_url:{$payment->id}:{$disk}";

        // Local/public disks don't need signed URLs or caching
        if ($disk === 'local' || $disk === 'public') {
            return Storage::disk($disk)->url($payment->receipt_path);
        }

        // Cache cloud signed URLs for 25 minutes (URL itself valid for 30 min)
        return cache()->remember($cacheKey, now()->addMinutes(25), function () use ($payment, $disk) {
            return Storage::disk($disk)->temporaryUrl(
                $payment->receipt_path,
                now()->addMinutes(30)
            );
        });
    }
}
