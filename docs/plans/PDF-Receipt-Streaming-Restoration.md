# PDF Receipt Streaming Restoration — Source of Truth Plan

## Background

The `landing-page` branch completed a full architectural refactor of the receipt system on **May 2, 2026**
(documented in `docs/PDF_RECEIPT_REFACTOR_REPORT.md`). When the branch was merged into `main` (commit
`a50f546`), the agent resolved conflicts by keeping the **old `main` disk-storage versions** of all
backend receipt files while keeping the **new `landing-page` frontend** (`ReceiptDownloadButton.tsx`).

The result is a three-way mismatch that causes a runtime 500 error on every receipt download:

| Layer | State | Problem |
|---|---|---|
| `ReceiptService` | OLD — `generate()` writes to `receipt_path` column | Column was dropped by migration; DB error |
| `HandlesReceipts` | OLD — returns `JSON { data: { url } }` | Frontend expects binary PDF stream |
| `ReceiptDownloadButton.tsx` | NEW — expects `application/pdf` blob | Never receives it |

---

## User Review Required

> [!CAUTION]
> `app/Listeners/ProcessPaymentConfirmed.php` is flagged as **SCAFFOLD — NOT YET WIRED** (lines 17–24).
> It has no active event listener registration. Removing `ReceiptService` from its constructor is safe
> but noted here for visibility.

> [!IMPORTANT]
> `app/Console/Commands/CleanupOldReceipts.php` will be **deleted** — it depends on
> `ReceiptService::cleanupOldReceipts()` which will no longer exist, and on-demand streaming
> produces no disk files to clean.

> [!NOTE]
> The Landlord Payments UI issue (tenant/unit columns showing "N/A") is a **pre-existing** bug from
> `main`, not introduced by this merge. It is included here as a medium-priority fix.

---

## Proposed Changes

### Phase 1 — Core Backend (Critical — fixes the 500 error)

---

#### [MODIFY] `app/Services/ReceiptService.php`

**Current:** 4 methods — `generate()`, `generateAsync()`, `cleanupOldReceipts()`, `getUrl()`  
**Target:** Single `stream()` method only

```php
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
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
            'Pragma'              => 'no-cache',
            'Expires'             => '0',
        ]);
    }
}
```

**Remove:** `use Illuminate\Support\Facades\Storage;` import (no longer needed).

---

#### [MODIFY] `app/Http/Controllers/Concerns/HandlesReceipts.php`

**Current:** Returns `JsonResponse` with `{ data: { url } }` after checking `receipt_path` and calling `generate()`  
**Target:** Checks payment status, calls `stream()`, returns PDF `Response` directly

```php
<?php

namespace App\Http\Controllers\Concerns;

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
        if (! in_array($payment->status, ['paid', 'partial'])) {
            abort(400, 'Receipt not available for unpaid payments.');
        }

        try {
            return $receiptService->stream($payment);
        } catch (\Exception $e) {
            Log::error('Receipt generation failed', [
                'payment_id' => $payment->id,
                'error'      => $e->getMessage(),
            ]);
            abort(500, 'Unable to generate receipt. Please try again.');
        }
    }
}
```

**Remove:** `use Illuminate\Http\JsonResponse;` and `use Illuminate\Support\Facades\Log;` — replace
`Log` import with the correct one, remove `JsonResponse`.

---

### Phase 2 — Model & Infrastructure Cleanup

---

#### [MODIFY] `app/Models/Payment.php`

Remove `'receipt_path'` from `$fillable` (line 79). The column was dropped by migration
`2026_05_02_205519_remove_receipt_path_from_payments_table`.

**Before:**
```php
protected $fillable = [
    ...
    'receipt_path',
    ...
];
```
**After:** Remove that line entirely.

---

#### [MODIFY] `bootstrap/app.php`

Remove the weekly cleanup schedule entry (line 40):

```php
// Remove this line:
$schedule->command('receipts:cleanup')->weekly();
```

---

#### [DELETE] `app/Console/Commands/CleanupOldReceipts.php`

This command calls `ReceiptService::cleanupOldReceipts()` which will no longer exist.
On-demand streaming produces no disk files, so cleanup is permanently unnecessary.

---

#### [MODIFY] `app/Listeners/ProcessPaymentConfirmed.php`

> [!NOTE]
> This file is SCAFFOLD — not wired into the application. Changes are low-risk.

Remove the `ReceiptService` dependency and automatic receipt generation (lines 86–92):

1. Remove `use App\Services\ReceiptService;` (line 9)
2. Remove `protected ReceiptService $receiptService` from constructor (line 34)
3. Remove the generate block (lines 86–92):
```php
// DELETE this entire block:
try {
    $this->receiptService->generate($payment);
    Log::info("Generated receipt for payment {$payment->id}");
} catch (\Exception $e) {
    Log::error("Failed generating receipt for payment {$payment->id}: ".$e->getMessage());
}
```

---

### Phase 3 — Test Suite Updates

---

#### [MODIFY] `tests/Feature/Api/Landlord/PaymentsApiTest.php`

Three receipt tests need updating:

**Test: `landlord can download a payment receipt as PDF` (line 172)**

```php
// BEFORE
$response = $this->getJson("/api/v1/landlord/payments/{$payment->id}/receipt");
$response->assertOk()
    ->assertJsonStructure(['data' => ['url']]);

// AFTER
$response = $this->get("/api/v1/landlord/payments/{$payment->id}/receipt");
$response->assertOk()
    ->assertHeader('Content-Type', 'application/pdf')
    ->assertHeaderContains('Content-Disposition', 'attachment');
```

**Test: `landlord receipt returns 400 for unpaid payment` (line 209)**

```php
// BEFORE
$this->getJson("/api/v1/landlord/payments/{$payment->id}/receipt")
    ->assertStatus(400)
    ->assertJson(['message' => 'Receipt not available for unpaid payments.']);

// AFTER — abort() sends the message in the response body but not as JSON
$this->get("/api/v1/landlord/payments/{$payment->id}/receipt")
    ->assertStatus(400);
```

**Test: `landlord receipt returns 500 when generation fails` (line 225)**

```php
// BEFORE
$this->mock(ReceiptService::class, function ($mock) {
    $mock->shouldReceive('generate')->andThrow(new RuntimeException('PDF engine failure'));
    $mock->shouldReceive('getUrl')->andReturn(null);
});
$this->getJson("/api/v1/landlord/payments/{$payment->id}/receipt")
    ->assertStatus(500)
    ->assertJson(['message' => 'Failed to generate receipt.']);

// AFTER
$this->mock(ReceiptService::class, function ($mock) {
    $mock->shouldReceive('stream')->andThrow(new RuntimeException('PDF engine failure'));
});
$this->get("/api/v1/landlord/payments/{$payment->id}/receipt")
    ->assertStatus(500);
```

---

#### [MODIFY] `tests/Feature/Api/Tenant/PaymentsApiTest.php`

Same three patterns as the Landlord test:

**Test: `tenant can download their own payment receipt` (line 58)**
- Change `getJson()` → `get()`
- Replace `assertJsonStructure(['data' => ['url']])` → `assertHeader('Content-Type', 'application/pdf')` + `assertHeaderContains('Content-Disposition', 'attachment')`

**Test: `tenant receipt returns 400 for unpaid payment` (line 95)**
- Change `getJson()` → `get()`
- Remove `->assertJson(['message' => '...'])` — keep only `->assertStatus(400)`

**Test: `tenant receipt returns 500 when generation fails` (line 111)**
- Change mock from `generate`/`getUrl` → `stream`
- Change `getJson()` → `get()`
- Remove `->assertJson([...])` — keep only `->assertStatus(500)`

---

### Phase 4 — Medium Priority: Landlord UI Data Fix (Pre-existing)

---

#### [MODIFY] `app/Http/Controllers/Api/Landlord/PaymentController.php`

The `index()` method (line 47) maps payments to flat keys (`tenant_name`, `unit_number`) but the
React component `landlord/payments/index.tsx` reads nested paths (`payment.tenancy?.tenant?.full_name`,
`payment.tenancy?.unit?.unit_name`).

Update the `map()` to return nested objects matching what the frontend expects:

```php
->map(function ($payment) {
    return [
        'id'             => $payment->id,
        'amount'         => $payment->amount,
        'payment_type'   => $payment->payment_type,
        'payment_method' => $payment->payment_method,
        'status'         => $payment->status,
        'paid_at'        => $payment->paid_at,
        'due_date'       => $payment->due_date,
        'created_at'     => $payment->created_at,
        'rent_bill_id'   => $payment->rent_bill_id,
        'tenant' => $payment->tenant ? [
            'id'          => $payment->tenant->id,
            'full_name'   => $payment->tenant->full_name,
            'tenant_code' => $payment->tenant->tenant_code,
        ] : null,
        'tenancy' => $payment->tenancy ? [
            'id'   => $payment->tenancy->id,
            'unit' => $payment->tenancy->unit ? [
                'id'        => $payment->tenancy->unit->id,
                'unit_code' => $payment->tenancy->unit->unit_code,
                'property'  => $payment->tenancy->unit->property ? [
                    'id'   => $payment->tenancy->unit->property->id,
                    'name' => $payment->tenancy->unit->property->name,
                ] : null,
            ] : null,
        ] : null,
        'rent_bill' => $payment->rentBill ? [
            'id'            => $payment->rentBill->id,
            'billing_month' => $payment->rentBill->billing_month->format('Y-m'),
            'status'        => $payment->rentBill->status,
        ] : null,
    ];
})
```

---

## Verification Plan

### Step 1 — Confirm migration status
```bash
php artisan migrate:status
```
Confirm `2026_05_02_205519_remove_receipt_path_from_payments_table` is **Ran**.

### Step 2 — Run targeted tests
```bash
php artisan test --compact --filter=PaymentsApiTest
```
Expected: All 7 receipt-related tests pass across both Landlord and Tenant suites.

### Step 3 — Run full suite
```bash
php artisan test --compact
```
Expected: Zero regressions. All existing non-receipt tests remain green.

### Step 4 — Verify routes still present
```bash
php artisan route:list --path=receipt
```
Confirm both tenant and landlord receipt routes exist with `throttle:10,1`.

---

## Execution Order

| # | File | Priority | Action |
|---|---|---|---|
| 1 | `ReceiptService.php` | 🔴 Critical | Replace with `stream()` only |
| 2 | `HandlesReceipts.php` | 🔴 Critical | Replace with PDF-streaming version |
| 3 | `Payment.php` | 🔴 Critical | Remove `receipt_path` from `$fillable` |
| 4 | `bootstrap/app.php` | 🔴 Critical | Remove `receipts:cleanup` schedule |
| 5 | `CleanupOldReceipts.php` | 🔴 Critical | Delete file |
| 6 | `ProcessPaymentConfirmed.php` | 🟡 Medium | Remove `ReceiptService` dependency |
| 7 | `PaymentsApiTest.php` (Landlord) | 🔴 Critical | Update 3 receipt tests |
| 8 | `PaymentsApiTest.php` (Tenant) | 🔴 Critical | Update 3 receipt tests |
| 9 | `PaymentController.php` (Landlord `index`) | 🟡 Medium | Fix nested response structure |
