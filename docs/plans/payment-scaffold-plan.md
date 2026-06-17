# Hand-Off: Payment System Scaffold (Phase 3 — Unwired)
## Estate Practice — `port/payment-architecture` branch

> **Purpose**: Implement the Phase 3 payment architecture as a **dead scaffold** — all files exist in the repo, the DB schema is updated, but nothing is reachable from any API route or controller. The existing payment flow is untouched. This can be fully uprooted in minutes using the teardown list at the bottom.

---

## 1. Project Context

- **Repo**: `luisosena/estate-practice` (private, GitHub)
- **Active branch**: `port/payment-architecture`
- **Local path**: `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice`
- **Latest commit**: `3e69621` — fix(api): fix unit eager loading nulls and unify timestamp formats
- **Test suite**: 336 tests, all passing — must remain green throughout
- **Source reference branch**: `architectural-refactoring` — read via `git show architectural-refactoring:<path>`

### Critical conventions
- All API responses use `{ data: ..., meta: ... }` — do not change this
- All role checks use `App\Enums\Role` enum — no string literals
- Run `vendor/bin/pint --dirty --format agent` after any PHP file changes
- Use PowerShell — do NOT use `&&` as a command separator (run commands separately)

---

## 2. What "Scaffold-Only" Means

**DO create** these things:
- All contracts, gateway classes, events, listeners, config, migrations
- A rewritten `PaymentService` that references the gateway interface
- `.env.example` entries for M-Pesa / gateway config

**DO NOT touch** any of these — they are explicitly out of scope:
- `routes/api.php` — no new routes
- `routes/webhooks.php` — do not create this file
- `bootstrap/app.php` — no webhook route registration
- `bootstrap/providers.php` — `PaymentGatewayServiceProvider` is created but **NOT registered** here
- `app/Providers/AppServiceProvider.php` — no `Event::listen()` wiring
- Any existing controller — no delegation changes to `PaymentController` or `PaymentsController`

> [!CAUTION]
> The `PaymentGatewayServiceProvider` must **NOT** be added to `bootstrap/providers.php`. The file should exist on disk but remain unregistered. This is intentional — it means `app(PaymentGatewayInterface::class)` will fail, which is the desired state for an unwired scaffold.

### Scaffold Docblock (apply to every new file)

Every new file created by this scaffold must include this docblock at the top of the class or interface:

```php
/**
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 *
 * This file is part of the payment gateway scaffold. It has been ported from
 * the `architectural-refactoring` branch but is NOT yet wired into the
 * application. No route, controller, or service provider references this file.
 *
 * To activate: follow docs/plans/porting-plan.md Phase 3 wiring steps.
 * To remove:   follow the teardown inventory in handoff_payment_scaffold.md.
 */
```

---

## 3. Pre-Flight Checks

Run all of these before touching any file:

```bash
git status
# Expected: on port/payment-architecture, clean working tree

git log --oneline -3
# Expected: 3e69621 at the top

php artisan route:list --path=api/v1
# Expected: 65 routes, no errors

php artisan test --compact
# Expected: 336 tests, 0 failures
```

---

## 4. Files to Create

### 4.1 — `config/payments.php` (NEW)

**Source**:
```bash
git show architectural-refactoring:config/payments.php
```

Copy it exactly. Add the scaffold docblock as a comment at the top of the file (before `<?php` is not valid — add it as a PHP comment after `<?php`):

```php
<?php

/*
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 * Not wired into the application. See handoff_payment_scaffold.md for details.
 */
```

---

### 4.2 — `app/Contracts/PaymentGatewayInterface.php` (NEW)

**Source**:
```bash
git show architectural-refactoring:app/Contracts/PaymentGatewayInterface.php
```

Create the directory `app/Contracts/` if it doesn't exist. Copy the interface exactly. Add the scaffold docblock to the interface body.

---

### 4.3 — `app/PaymentGateways/ManualGateway.php` (NEW)

**Source**:
```bash
git show architectural-refactoring:app/PaymentGateways/ManualGateway.php
```

Create the directory `app/PaymentGateways/` if it doesn't exist. Copy exactly. Add scaffold docblock.

---

### 4.4 — `app/PaymentGateways/MpesaGateway.php` (NEW)

**Source**:
```bash
git show architectural-refactoring:app/PaymentGateways/MpesaGateway.php
```

Copy exactly. Add scaffold docblock.

---

### 4.5 — `app/Providers/PaymentGatewayServiceProvider.php` (NEW — NOT registered)

**Source**:
```bash
git show architectural-refactoring:app/Providers/PaymentGatewayServiceProvider.php
```

Copy exactly. Add scaffold docblock. **Do NOT add it to `bootstrap/providers.php`.**

---

### 4.6 — Database Migration (NEW)

**Source**: First find the exact filename:
```bash
git show architectural-refactoring:database/migrations
```

Look for the migration named `add_gateway_fields_to_payments_table`. Then read it:
```bash
git show architectural-refactoring:database/migrations/<exact_filename>.php
```

Copy the file into `database/migrations/`. Add scaffold comment at the top after `<?php`:

```php
/*
 * SCAFFOLD — PAYMENT SYSTEM (Phase 3)
 * Adds gateway fields to the payments table.
 * Rollback with: php artisan migrate:rollback --step=1
 */
```

**Run the migration immediately after creating it**:
```bash
php artisan migrate
```

Verify:
```bash
php artisan migrate:status
# The new migration must show "Ran"
```

The new columns this adds to `payments` are:
`gateway`, `checkout_request_id`, `gateway_reference`, `gateway_status`, `gateway_metadata`, `gateway_confirmed_at`, `receipt_path`

---

### 4.7 — `app/Events/PaymentConfirmed.php` (NEW)

**Source**:
```bash
git show architectural-refactoring:app/Events/PaymentConfirmed.php
```

Create `app/Events/` directory if needed. Copy exactly. Add scaffold docblock.

---

### 4.8 — `app/Listeners/ProcessPaymentConfirmed.php` (NEW)

**Source**:
```bash
git show architectural-refactoring:app/Listeners/ProcessPaymentConfirmed.php
```

Create `app/Listeners/` directory if needed. Copy exactly. Add scaffold docblock.

> [!IMPORTANT]
> Do NOT wire this listener anywhere. Do NOT add `Event::listen(PaymentConfirmed::class, ProcessPaymentConfirmed::class)` to `AppServiceProvider`. The event and listener files exist on disk only.

---

### 4.9 — `app/Services/PaymentService.php` (REWRITE)

**This file already exists** on `port/payment-architecture`. Read the current version first:
```bash
# Read current version
cat app/Services/PaymentService.php
```

Then read the source version:
```bash
git show architectural-refactoring:app/Services/PaymentService.php
```

**Porting rule**: Do NOT replace the file wholesale. The architectural-refactoring version introduces gateway dispatch logic. Port only the gateway-related methods into the existing file while keeping any `main`-specific changes.

Specifically, add/update these methods from the source:
- Any method that calls `$this->gateway->charge(...)` or similar gateway dispatch
- The idempotency window guard (if present)
- The `load()` relationship eager-loading fix from Phase 5 (if present in source)

Add the scaffold docblock to the class.

> [!NOTE]
> The rewritten `PaymentService` references `PaymentGatewayInterface` via constructor injection. Since the `PaymentGatewayServiceProvider` is NOT registered, Laravel cannot auto-resolve `PaymentService` via the container — but that is fine because no controller calls it yet. The existing controllers still use the old direct model logic (unchanged).

---

## 5. Existing File Modifications

### 5.1 — `app/Models/Payment.php` (MODIFY — add gateway fields)

**Source**:
```bash
git show architectural-refactoring:app/Models/Payment.php
```

Compare with the current `app/Models/Payment.php`. Add **only** these gateway-related fields to the `$fillable` array (do not replace the whole file):

```php
'gateway',
'checkout_request_id',
'gateway_reference',
'gateway_status',
'gateway_metadata',
'gateway_confirmed_at',
'receipt_path',
```

And add these to the `casts()` method if they are missing:
```php
'gateway_metadata' => 'array',
'gateway_confirmed_at' => 'datetime',
```

Add a comment next to the new fields:
```php
// SCAFFOLD: gateway fields — see PaymentGatewayInterface
'gateway',
```

---

### 5.2 — `.env.example` (MODIFY — add gateway env vars)

Add this block at the bottom of `.env.example`:

```dotenv
# --- PAYMENT GATEWAY SCAFFOLD (Phase 3 — not yet active) ---
PAYMENTS_DEFAULT_GATEWAY=manual
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_BUSINESS_SHORT_CODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
MPESA_ENVIRONMENT=sandbox
```

---

## 6. Complete File Inventory (Scaffold Footprint)

This is the **exhaustive list of every file touched by this scaffold**. Keep it accurate.

### New files created
```
config/payments.php
app/Contracts/PaymentGatewayInterface.php
app/PaymentGateways/ManualGateway.php
app/PaymentGateways/MpesaGateway.php
app/Providers/PaymentGatewayServiceProvider.php
app/Events/PaymentConfirmed.php
app/Listeners/ProcessPaymentConfirmed.php
database/migrations/<date>_add_gateway_fields_to_payments_table.php
```

### Existing files modified
```
app/Services/PaymentService.php       — gateway methods added, scaffold docblock added
app/Models/Payment.php                — 7 gateway fields added to $fillable and casts()
.env.example                          — gateway env var block added
```

### Intentionally NOT created/modified
```
routes/webhooks.php                   — not created
routes/api.php                        — not modified
bootstrap/app.php                     — not modified
bootstrap/providers.php               — not modified (PaymentGatewayServiceProvider unregistered)
app/Providers/AppServiceProvider.php  — not modified (no Event::listen)
app/Http/Controllers/Api/Landlord/PaymentController.php   — not modified
app/Http/Controllers/Api/Tenant/PaymentsController.php    — not modified
```

---

## 7. Verification Checklist

After all files are created, run in order:

```bash
# 1. Full test suite — must stay at 336, zero failures
php artisan test --compact

# 2. Route list — must still be exactly 65 routes, no new payment/webhook routes
php artisan route:list --path=api/v1
# Count: should still show [65] routes

# 3. Config loads cleanly
php artisan config:clear
php artisan config:show payments
# Expected: shows gateway config values

# 4. Migration ran
php artisan migrate:status
# Expected: scaffold migration shows "Ran"

# 5. Scaffold is inert — container cannot resolve gateway (ServiceProvider not registered)
php artisan tinker --execute "try { app(App\Contracts\PaymentGatewayInterface::class); echo 'ERROR: should not resolve'; } catch (\Exception \$e) { echo 'OK: ' . get_class(\$e); }"
# Expected: BindingResolutionException — confirms scaffold is correctly unwired

# 6. Pint formatting
vendor/bin/pint --dirty --format agent
# Expected: no changes needed
```

---

## 8. Commit

```bash
git add -A
git commit -m "scaffold(payment): port Phase 3 gateway architecture — unwired

Adds the payment gateway scaffold to the repo as dead code.
Nothing is reachable from any API route or controller.
The existing payment flow (PaymentController/PaymentsController) is unchanged.

New files:
- config/payments.php
- app/Contracts/PaymentGatewayInterface.php
- app/PaymentGateways/ManualGateway.php
- app/PaymentGateways/MpesaGateway.php
- app/Providers/PaymentGatewayServiceProvider.php (unregistered)
- app/Events/PaymentConfirmed.php
- app/Listeners/ProcessPaymentConfirmed.php
- database/migrations/xxxx_add_gateway_fields_to_payments_table.php

Modified files:
- app/Services/PaymentService.php (gateway methods added, not injected)
- app/Models/Payment.php (7 gateway fields in fillable/casts)
- .env.example (gateway env var block)

NOT wired:
- No routes registered
- PaymentGatewayServiceProvider NOT in bootstrap/providers.php
- No Event::listen binding
- No controller changes

To activate: follow docs/plans/porting-plan.md Phase 3 wiring steps.
To remove: follow teardown in handoff_payment_scaffold.md."
```

---

## 9. Teardown Inventory (Reference Only — Do Not Execute)

> [!CAUTION]
> **This section is documentation for the future. The agent implementing the scaffold must NOT execute any step in this section.** These instructions exist so that when the user decides to remove the scaffold, the steps are already written and verified. Read it, understand it, then stop — do not run any of these commands.

If the payment design changes and this scaffold needs to be completely removed, a future agent should execute these steps in order:

### Step 1 — Roll back the DB migration
```bash
php artisan migrate:rollback --step=1
# Verify the migration shows "Pending" in migrate:status
```

### Step 2 — Delete all new files
```bash
Remove-Item app/Contracts/PaymentGatewayInterface.php
Remove-Item app/PaymentGateways/ManualGateway.php
Remove-Item app/PaymentGateways/MpesaGateway.php
Remove-Item app/PaymentGateways/ -Recurse
Remove-Item app/Contracts/ -Recurse
Remove-Item app/Providers/PaymentGatewayServiceProvider.php
Remove-Item app/Events/PaymentConfirmed.php
Remove-Item app/Listeners/ProcessPaymentConfirmed.php
Remove-Item config/payments.php
Remove-Item database/migrations/<date>_add_gateway_fields_to_payments_table.php
```

### Step 3 — Revert modified files

**`app/Models/Payment.php`**: Remove the 7 gateway fields from `$fillable`:
`gateway`, `checkout_request_id`, `gateway_reference`, `gateway_status`, `gateway_metadata`, `gateway_confirmed_at`, `receipt_path`

And remove from `casts()`:
`gateway_metadata`, `gateway_confirmed_at`

**`app/Services/PaymentService.php`**: Remove gateway-specific methods and the scaffold docblock. Restore to pre-scaffold state using:
```bash
git show <commit-before-scaffold>:app/Services/PaymentService.php
```

**`.env.example`**: Remove the `# --- PAYMENT GATEWAY SCAFFOLD ---` block and all `MPESA_*` / `PAYMENTS_*` lines.

### Step 4 — Verify clean removal
```bash
php artisan test --compact
# Expected: 336 tests, 0 failures

php artisan route:list --path=api/v1
# Expected: 65 routes, no errors

php artisan config:clear
# Expected: no errors (payments.php config is gone)
```

### Step 5 — Commit the removal
```bash
git add -A
git commit -m "revert: remove payment gateway scaffold (Phase 3)"
```
