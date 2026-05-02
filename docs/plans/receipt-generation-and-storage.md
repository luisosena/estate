# Hand-Off: Phase 4 — Receipt Generation & Storage
## Estate Practice — `port/payment-architecture` branch

> **Purpose**: Implement the receipt generation feature (Phase 4) as a fully wired, production-ready feature. This phase adds `GET /api/v1/landlord/payments/{id}/receipt` and `GET /api/v1/tenant/payments/{id}/receipt` endpoints that generate and stream a PDF receipt for any payment. Unlike Phase 3 which was scaffolded, **Phase 4 is fully wired and live**.

---

## 1. Project Context

- **Repo**: `luisosena/estate-practice` (private, GitHub)
- **Active branch**: `port/payment-architecture`
- **Local path**: `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice`
- **Latest commit**: `02f3d73` — scaffold(payment): port Phase 3 gateway architecture — unwired
- **Source reference branch**: `architectural-refactoring`

### Existing payment routes (do not modify these)
```
GET|HEAD  api/v1/landlord/payments                  PaymentController@index
POST      api/v1/landlord/payments                  PaymentController@store
GET|HEAD  api/v1/landlord/payments/{paymentId}      PaymentController@show
PUT       api/v1/landlord/payments/{paymentId}      PaymentController@update
DELETE    api/v1/landlord/payments/{paymentId}      PaymentController@destroy
GET|HEAD  api/v1/tenant/payments                    PaymentsController@index
POST      api/v1/tenant/payments                    PaymentsController@store
```

### Critical conventions
- All API responses use `{ data: ..., meta: ... }` — preserve this shape
- All role checks use `App\Enums\Role` enum — no string literals
- Run `vendor/bin/pint --dirty --format agent` after any PHP file changes
- Use PowerShell — do NOT use `&&` as a command separator (run commands separately)

---

## 2. Pre-Flight Checks

Run all of these before touching any file:

```bash
git status
# Expected: on port/payment-architecture, clean working tree

git log --oneline -3
# Expected: 02f3d73 at top

php artisan route:list --path=api/v1
# Expected: routes present, no errors

php artisan test --compact
# Expected: all tests passing (note exact count for regression check)

# Confirm dompdf is NOT yet installed
php artisan tinker --execute "echo class_exists(\Barryvdh\DomPDF\Facade\Pdf::class) ? 'installed' : 'not installed';"
# Expected: "not installed"
```

---

## 3. Step 3.1 — Install DomPDF

```bash
composer require barryvdh/laravel-dompdf
```

Verify installation:
```bash
php artisan tinker --execute "echo class_exists(\Barryvdh\DomPDF\Facade\Pdf::class) ? 'OK' : 'FAIL';"
# Expected: OK
```

> [!NOTE]
> `barryvdh/laravel-dompdf` auto-discovers via Laravel package discovery — no manual registration in `config/app.php` needed. The `Pdf` facade is available immediately after install.

---

## 4. Step 4.1 — `ReceiptService` (NEW)

**Source**:
```bash
git show architectural-refactoring:app/Services/ReceiptService.php
```

Create `app/Services/ReceiptService.php` exactly as shown in the source.

### Key things to verify in the source before copying

1. **Null-safe operators**: The Phase 5 fix applied null-safe `?->` operators throughout the Blade template rendering data. Ensure these are present in the ported version (they should be since Phase 5 fixes are baked into `architectural-refactoring`).

2. **Storage path**: The service likely stores receipts at `storage/app/receipts/`. This is fine — no config change needed.

3. **`receipt_path` column**: The receipt service may write the generated PDF path to `payments.receipt_path`. This column **already exists** — it was added by the Phase 3 scaffold migration (`add_gateway_fields_to_payments_table`).

4. **Dependencies**: The service uses `Barryvdh\DomPDF\Facade\Pdf` (just installed) and standard Laravel storage (`Storage`). No other new dependencies.

---

## 5. Step 4.2 — Blade PDF Template (NEW)

**Source**:
```bash
git show architectural-refactoring:resources/views/receipts/payment.blade.php
```

Create `resources/views/receipts/payment.blade.php` exactly as shown.

### Important: null-safe operator check

The template accesses deeply nested relationships. Every relationship access must use `?->` (null-safe). Scan the template for any bare `->` on relationship chains and convert them. Examples:

```blade
{{-- WRONG — will crash if tenancy is null --}}
{{ $payment->tenancy->unit->unit_code }}

{{-- CORRECT --}}
{{ $payment->tenancy?->unit?->unit_code }}
```

> [!CAUTION]
> If the source template has any bare `->` on nullable relationships, fix them before saving. This is the most common crash point for the receipt feature.

---

## 6. Step 4.3 — Routes (MODIFY `routes/api.php`)

**Source** (to find the exact route definitions):
```bash
git show architectural-refactoring:routes/api.php
```

Search for `receipt` in the source output to find the two route definitions. Then add them to `main`'s `routes/api.php`.

### What to add — Landlord route

Find the existing landlord payments route group in `routes/api.php`. It looks roughly like:
```php
Route::prefix('landlord')->middleware([...])->group(function () {
    // ... existing landlord routes ...
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{paymentId}', [PaymentController::class, 'show']);
    Route::put('/payments/{paymentId}', [PaymentController::class, 'update']);
    Route::delete('/payments/{paymentId}', [PaymentController::class, 'destroy']);
    // ADD THIS LINE:
    Route::get('/payments/{paymentId}/receipt', [PaymentController::class, 'receipt']);
});
```

### What to add — Tenant route

Find the tenant payments route group:
```php
Route::prefix('tenant')->middleware([...])->group(function () {
    // ... existing tenant routes ...
    Route::get('/payments', [PaymentsController::class, 'index']);
    Route::post('/payments', [PaymentsController::class, 'store']);
    // ADD THIS LINE:
    Route::get('/payments/{paymentId}/receipt', [PaymentsController::class, 'receipt']);
});
```

> [!IMPORTANT]
> Use `{paymentId}` (integer route parameter) to match the existing pattern in both controllers — not `{payment}` (model binding). Both controllers currently use `int $paymentId` parameters, not implicit route model binding.

---

## 7. Step 4.4 — `receipt()` on Landlord `PaymentController` (MODIFY)

**File**: `app/Http/Controllers/Api/Landlord/PaymentController.php`

**Source**:
```bash
git show architectural-refactoring:app/Http/Controllers/Api/Landlord/PaymentController.php
```

Find the `receipt()` method in the source and add it to `main`'s `PaymentController`.

### Add the import at the top of the file (if not already there):
```php
use App\Services\ReceiptService;
```

### Add the `receipt()` method after `destroy()`:

The method pattern should be:

```php
/**
 * Generate and download a payment receipt PDF.
 * GET /api/v1/landlord/payments/{paymentId}/receipt
 */
public function receipt(Request $request, int $paymentId)
{
    $landlord = $request->user();

    // Verify the payment belongs to this landlord's properties
    $payment = Payment::whereHas('tenancy.unit.property', function ($query) use ($landlord) {
        $query->where('owner_id', $landlord->id);
    })
        ->with(['tenant', 'tenancy.unit.property', 'rentBill'])
        ->findOrFail($paymentId);

    // Use the source's exact implementation here — port from architectural-refactoring
    // Key: the method should call app(ReceiptService::class)->generate($payment)
    // and return a PDF response (either stream or download)
}
```

> [!IMPORTANT]
> Copy the exact implementation from the source, not the skeleton above. The skeleton is just to show the ownership check pattern that must be preserved.

---

## 8. Step 4.5 — `receipt()` on Tenant `PaymentsController` (MODIFY)

**File**: `app/Http/Controllers/Api/Tenant/PaymentsController.php`

**Source**:
```bash
git show architectural-refactoring:app/Http/Controllers/Api/Tenant/PaymentsController.php
```

Find the `receipt()` method in the source and add it to `main`'s `PaymentsController`.

### Add the import at the top of the file (if not already there):
```php
use App\Services\ReceiptService;
```

### Tenant ownership check pattern

The tenant controller must verify the payment belongs to the requesting tenant's active tenancy. The ownership check pattern in the tenant controller is different from the landlord:

```php
// The payment must belong to THIS tenant
$payment = Payment::where('tenant_id', $tenant->id)
    ->with(['tenant', 'tenancy.unit.property', 'rentBill'])
    ->findOrFail($paymentId);
```

Again — copy the exact implementation from the source, adapting only the ownership check if the source uses a different approach.

---

## 9. Complete File Inventory (Phase 4 Footprint)

### New files created
```
app/Services/ReceiptService.php
resources/views/receipts/payment.blade.php
```

### Existing files modified
```
composer.json / composer.lock     — barryvdh/laravel-dompdf added
routes/api.php                    — 2 receipt routes added
app/Http/Controllers/Api/Landlord/PaymentController.php   — receipt() method added
app/Http/Controllers/Api/Tenant/PaymentsController.php    — receipt() method added
```

### Not modified by Phase 4
```
app/Services/PaymentService.php     — Phase 3 scaffold, untouched
bootstrap/providers.php             — PaymentGatewayServiceProvider still unregistered
app/Providers/AppServiceProvider.php — still no Event::listen
```

---

## 10. Verification Checklist

Run in order after all files are created:

```bash
# 1. Route list — must show 2 new receipt routes
php artisan route:list --path=api/v1
# Expected: now 67 routes total (65 + 2 new receipt routes)
# Must see:
#   GET|HEAD  api/v1/landlord/payments/{paymentId}/receipt
#   GET|HEAD  api/v1/tenant/payments/{paymentId}/receipt

# 2. Container resolves ReceiptService
php artisan tinker --execute "echo get_class(app(App\Services\ReceiptService::class));"
# Expected: App\Services\ReceiptService

# 3. Full test suite — must stay green
php artisan test --compact
# Expected: same count as pre-flight, 0 failures

# 4. Pint formatting
vendor/bin/pint --dirty --format agent
# Expected: no changes needed
```

---

## 11. Tests to Write

After verifying the above, write Pest contract tests for both receipt endpoints.

### Find existing test files
```bash
php artisan test --compact --filter=Payment
# See what payment test files already exist
```

Likely files:
- `tests/Feature/Api/Landlord/PaymentApiTest.php`
- `tests/Feature/Api/Tenant/PaymentsApiTest.php`

### Add to each file

#### Landlord receipt test
```php
it('landlord can download a payment receipt as PDF', function () {
    $landlord = User::factory()->landlord()->create();
    $property = Property::factory()->for($landlord, 'owner')->create();
    $unit = Unit::factory()->for($property)->create();
    $tenant = Tenant::factory()->create();
    $tenancy = Tenancy::factory()->for($unit)->for($tenant)->active()->create();
    $payment = Payment::factory()->for($tenant)->for($tenancy)->create([
        'status' => 'paid',
    ]);

    $response = $this->actingAs($landlord)
        ->getJson("/api/v1/landlord/payments/{$payment->id}/receipt");

    // Receipt should return PDF (200) or a JSON with receipt URL/path
    $response->assertStatus(200);
    // If streaming PDF:
    // expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});

it('landlord cannot download receipt for another landlord\'s payment', function () {
    $landlord = User::factory()->landlord()->create();
    $otherPayment = Payment::factory()->create(); // belongs to different landlord

    $this->actingAs($landlord)
        ->getJson("/api/v1/landlord/payments/{$otherPayment->id}/receipt")
        ->assertStatus(404);
});
```

#### Tenant receipt test
```php
it('tenant can download their own payment receipt', function () {
    $user = User::factory()->tenant()->create();
    $tenant = Tenant::factory()->for($user)->create();
    $tenancy = Tenancy::factory()->for($tenant)->active()->create();
    $payment = Payment::factory()->for($tenant)->for($tenancy)->create([
        'status' => 'paid',
    ]);

    $response = $this->actingAs($user)
        ->getJson("/api/v1/tenant/payments/{$payment->id}/receipt");

    $response->assertStatus(200);
});

it('tenant cannot download another tenant\'s receipt', function () {
    $user = User::factory()->tenant()->create();
    $tenant = Tenant::factory()->for($user)->create();
    $otherPayment = Payment::factory()->create(); // different tenant

    $this->actingAs($user)
        ->getJson("/api/v1/tenant/payments/{$otherPayment->id}/receipt")
        ->assertStatus(404);
});
```

> [!NOTE]
> Adjust factory states (`.landlord()`, `.tenant()`, `.active()`) to match what already exists in the project. Run `php artisan tinker --execute "echo (new \Database\Factories\UserFactory)->definition()['role'];"` to check factory defaults if unsure.

Run new tests:
```bash
php artisan test --compact --filter=receipt
# All new receipt tests must pass
```

---

## 12. Commit

```bash
git add -A
git commit -m "feat(phase4): receipt generation — ReceiptService, DomPDF template, PDF endpoints

- composer: install barryvdh/laravel-dompdf
- app/Services/ReceiptService.php: new — generates PDF receipt from Payment model
- resources/views/receipts/payment.blade.php: new — DomPDF Blade template with null-safe operators
- routes/api.php: add GET /landlord/payments/{id}/receipt and GET /tenant/payments/{id}/receipt
- PaymentController: add receipt() method (landlord ownership check via owner_id)
- PaymentsController: add receipt() method (tenant ownership check via tenant_id)
- tests: add receipt contract tests for both landlord and tenant endpoints"
```

---

## 13. Opener for the New Chat

> *"Read `C:\Users\Admin\.gemini\antigravity\brain\6a80cf49-aa79-48ed-b14e-86280fab9b00\handoff_phase4_receipts.md` in full before touching anything. Implement every step in order. Phase 3 scaffold is already in the repo and must NOT be touched. The goal is a fully wired, working receipt PDF endpoint for both landlord and tenant. Write the Pest tests in Section 11 and verify they pass before committing."*
