# Post-Merge Audit: `landing-page` → `main` (commit `a50f546`)

## Summary

The merge incorporated the landing-page editorial redesign and the PDF receipt refactor. Most of the landing-page UI work was merged correctly. However, **the PDF receipt refactor — the most critical backend change on the landing-page branch — was completely lost during conflict resolution**. The agent resolved the conflict by keeping the old `main` branch versions of the core receipt files instead of the newer `landing-page` versions. This has left the codebase in a **broken, internally inconsistent state** where receipt downloads fail at runtime (confirmed by two failing tests).

---

## ✅ What Was Correctly Merged

### `routes/api.php`
Both branches had the receipt routes. The `main` branch had added `throttle:10,1` middleware to the receipt endpoints (the `landing-page` branch did not). The merge correctly kept the throttled versions.

```
Route::middleware('throttle:10,1')->get('payments/{paymentId}/receipt', ...)
```
✅ **Correct — the more hardened version was kept.**

---

### `bootstrap/app.php`
Three distinct features existed across the two branches:

| Feature | `main` branch | `landing-page` branch |
|---|---|---|
| `EnsureFrontendRequestsAreStateful` in API middleware | ✅ Yes | ✅ Yes |
| Sentry exception reporting | ✅ Yes | ❌ No |
| `shouldRenderJsonWhen` for API | ❌ No | ✅ Yes |
| `sanctum:prune-expired` schedule | ✅ Yes | ❌ No |

The merge **correctly combined all four features**. The post-merge `bootstrap/app.php` is the proper superset.

✅ **Correct — all logic from both branches preserved.**

---

### Landing Page UI Components
The following new components from `landing-page` were correctly brought in:

- `top-bar.tsx` — ✅ Added
- `pain-solution-section.tsx` — ✅ Added
- `product-preview-section.tsx` — ✅ Added
- `home.tsx` — ✅ Updated to include all new sections
- `navbar.tsx`, `hero-section.tsx`, `testimonials-section.tsx`, `cta-section.tsx` — ✅ Updated

✅ **Correct — the editorial redesign is fully intact.**

---

### `ReceiptDownloadButton.tsx`
This component was added by the `landing-page` branch and was correctly brought into the merge. It is identical to the version on the `landing-page` branch.

✅ **Correct — component was added.**

---

## 🔴 CRITICAL: PDF Receipt Refactor Was Lost

This is the most significant failure in the merge. The `landing-page` branch contained a complete architectural refactor of the receipt system. The agent resolved the conflicts by keeping the **old `main` branch logic** for the receipt backend files, while keeping the **new `landing-page` frontend** (`ReceiptDownloadButton`). These two are fundamentally incompatible.

### The Two Designs

#### `landing-page` branch (the **intended** design after refactor):
- `ReceiptService::stream(Payment $payment): Response` — generates PDF **on demand** and streams it directly as `application/pdf`. **No disk storage. No `receipt_path` field.**
- `HandlesReceipts::buildReceiptResponse()` — calls `$receiptService->stream()` and returns the PDF `Response` directly.
- `ReceiptDownloadButton.tsx` — fetches the endpoint, receives a raw PDF binary blob, verifies it with `%PDF` magic bytes, and triggers a browser download.

#### `main` branch (the **old** design):
- `ReceiptService::generate()` + `getUrl()` — stores PDF to disk, writes path to `payments.receipt_path` DB column, then returns a signed URL.
- `HandlesReceipts::buildReceiptResponse()` — checks `$payment->receipt_path`, generates if missing, then returns `JSON { data: { url: '...' } }`.

### What the Merge Agent Did

The agent kept the **old `main` branch** versions for all three backend files, and kept the **new `landing-page`** version of the frontend component. This created a three-way mismatch:

---

### Issue 1 — `ReceiptService.php` is the wrong version

**Current state (WRONG):** `app/Services/ReceiptService.php` is the `main` branch version with `generate()`, `generateAsync()`, `cleanupOldReceipts()`, and `getUrl()`. It still calls `$payment->update(['receipt_path' => $path])`.

**What it should be:** The `landing-page` version with a single `stream()` method that returns a PDF `Response`.

**Why it breaks:** The `generate()` method tries to write to `payments.receipt_path`. That column **was dropped** by migration `2026_05_02_205519_remove_receipt_path_from_payments_table`, which has already run (batch 21). Calling `generate()` will throw a database error, causing a 500 response. **Confirmed by tests.**

---

### Issue 2 — `HandlesReceipts.php` is the wrong version

**Current state (WRONG):** `app/Http/Controllers/Concerns/HandlesReceipts.php` is the `main` branch version. It:
1. Checks `$payment->receipt_path` (always null/empty — the column is gone)
2. Calls `$receiptService->generate()` (will fail with DB error — see Issue 1)
3. Returns `JsonResponse { data: { url: '...' } }` — not a PDF stream

**What it should be:** The `landing-page` version, which:
1. Checks `$payment->status` directly
2. Calls `$receiptService->stream()` and returns the `Response` directly as `application/pdf`

**Why it breaks:** The frontend (`ReceiptDownloadButton`) makes a `fetch()` call, checks for `Content-Type: application/pdf`, and validates the `%PDF` magic bytes. The backend is returning JSON (or a 500). The frontend will always show the error toast: *"Server returned an error page instead of PDF."*

---

### Issue 3 — `Payment` model `$fillable` is stale

**Current state:** `app/Models/Payment.php` still has `'receipt_path'` in the `$fillable` array (line 79).

**What it should be:** `receipt_path` must be removed from `$fillable` since the column no longer exists in the database.

**Impact:** Non-breaking at runtime (Eloquent ignores unknown fillable columns gracefully), but it is misleading and should be cleaned up.

---

### Issue 4 — Tests are asserting the wrong contract

**Current state:** The existing tests in `Tests\Feature\Api\Landlord\PaymentsApiTest` and `Tests\Feature\Api\Tenant\PaymentsApiTest` assert `->assertJsonStructure(['data' => ['url']])` — the **old** JSON URL contract.

**What they should assert:** That the response has `Content-Type: application/pdf` and a 200 status — the **new** streaming contract.

This means the tests were written for the old system but the new system was supposed to replace it. They need to be rewritten alongside the fix.

---

## Fix Plan

The following files need to be restored to their `landing-page` branch state. These are exact, known-good versions already in git history.

### 1. Restore `ReceiptService.php`
Replace with the streaming version from commit `c09fa7d`. The service should have **only** the `stream()` method. Remove `generate()`, `generateAsync()`, `cleanupOldReceipts()`, and `getUrl()`.

> [!WARNING]
> The `receipts:cleanup` artisan command registered in `bootstrap/app.php` (the weekly schedule) depends on `cleanupOldReceipts()`. With on-demand streaming (no files written to disk), **the cleanup command is also now obsolete** and should be removed from the schedule.

### 2. Restore `HandlesReceipts.php`
Replace with the streaming version from commit `c09fa7d`. The trait should call `$receiptService->stream()` and return an `\Illuminate\Http\Response`, not a `JsonResponse`.

### 3. Remove `receipt_path` from `Payment::$fillable`
Remove `'receipt_path'` from the `$fillable` array in `app/Models/Payment.php`.

### 4. Update the receipt tests
Rewrite the two failing receipt tests to assert:
- Response is `200 OK`
- `Content-Type` header contains `application/pdf`
- `Content-Disposition` header is present (contains `attachment; filename="receipt-...pdf"`)

### 5. Remove stale schedule entry from `bootstrap/app.php`
Remove `$schedule->command('receipts:cleanup')->weekly();` since there are no longer any files to clean up.

---

## Other Observations (Non-Critical)

| Area | Finding | Severity |
|---|---|---|
| `Payment::$fillable` has `receipt_path` | Stale, column doesn't exist | Low |
| `receipts:cleanup` in schedule | References deleted logic | Low |
| `landlord/payments/index.tsx` — Tenant column reads `tenancy.tenant.*` | API controller returns flat fields (`tenant_name`, `unit_number`), not nested objects | Medium — data may be blank in UI |
| Throttle on receipt routes | Both branches now have `throttle:10,1` ✅ | Fine |

> [!NOTE]
> The landlord payments page (`index.tsx`) reads `payment.tenancy?.tenant?.full_name` and `payment.tenancy?.unit?.unit_name` from the payment object. But the `PaymentController::index()` response maps these to flat keys (`tenant_name`, `unit_number`). The UI may show "N/A" for tenant and unit columns. This is a pre-existing issue from the `main` branch, not introduced by this merge.
