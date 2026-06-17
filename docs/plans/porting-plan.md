# Payment Architecture Porting Plan
## `architectural-refactoring` → `main`

> **Strategy**: Systematic "porting" — not a git merge. The agent will re-implement each layer of the Payment Architecture onto `main` branch's codebase, reading reference code from `architectural-refactoring` via `git show`. Each phase ends with a dedicated commit and a verification checkpoint before proceeding.

---

## Branch Context

| | Branch |
|---|---|
| **Target** (active work) | `main` — has undergone independent architectural changes (API response standardisation with `data`/`meta` wrapper, extensive mobile Jest tests, bug patches). |
| **Source** (reference) | `architectural-refactoring` — contains Phases 1–5 refactoring: Role enums, Policies, Notification channels, Payment gateway abstraction, M-Pesa webhook, Receipt PDF, and all Phase 5 code-review fixes. |
| **Remote** | `luisosena/estate-practice` (GitHub, private) |

> [!IMPORTANT]
> The `main` branch now wraps API responses in a `{ data: ..., meta: ... }` shape. When porting controllers and resources from `architectural-refactoring`, the agent MUST preserve this wrapper format. It must NOT blindly copy the old response shape.

---

## Pre-Flight Checklist (Do Before Starting the Chat)

The agent must run these commands first and verify each output before touching any files.

```bash
# 1. Confirm you are on main and it is clean
git status
git branch

# 2. Fetch latest remote state
git fetch origin

# 3. Make sure main is up to date with remote
git pull origin main

# 4. Verify the source branch is accessible
git log --oneline -3 architectural-refactoring

# 5. Create a safety working branch off main — DO NOT port directly onto main
git checkout -b port/payment-architecture

# 6. Verify Laravel is working before making any changes
php artisan config:clear && php artisan route:list --path=api/v1 | head -20
```

> [!CAUTION]
> All work must happen on `port/payment-architecture`. This branch will be PR'd into `main` only after ALL phases are verified. Never force-push or directly commit to `main`.

---

## How the Agent Reads Source Code

Any time the agent needs to inspect the reference implementation, it uses:

```bash
git show architectural-refactoring:<relative/path/to/file>
```

**Examples:**
```bash
git show architectural-refactoring:app/Services/PaymentService.php
git show architectural-refactoring:app/Contracts/PaymentGatewayInterface.php
git show architectural-refactoring:config/payments.php
```

This reads file contents from the other branch without switching to it.

---

## Phase 1: Foundation — Enums, Policies, API Resources

**Goal**: Port the structural backbone — type-safe Role enum, authorization policies, and API resource classes.

**Instruction to Agent:**
> Read `docs/projectsummary/REFACTORING_PHASES.md` Phase 1 section. For each file listed, run `git show architectural-refactoring:<path>` to read its contents, then recreate it on the `port/payment-architecture` branch. Adapt as needed to fit `main`'s conventions.

### Step 1.1 — Role Enum

```bash
git show architectural-refactoring:app/Enums/Role.php
```
- Create `app/Enums/Role.php` as shown.
- Edit `app/Models/User.php`: add `'role' => \App\Enums\Role::class` to the `$casts` array.

**✅ Verification**: Run `php artisan tinker --execute="echo App\Enums\Role::LANDLORD->value;"` — must return `landlord` (or whichever the value is).

### Step 1.2 — Authorization Policies

```bash
git show architectural-refactoring:app/Policies/PaymentPolicy.php
git show architectural-refactoring:app/Policies/PropertyPolicy.php
git show architectural-refactoring:app/Policies/TenantPolicy.php
git show architectural-refactoring:app/Policies/RentBillPolicy.php
```
- Create each policy file.
- Verify `AuthServiceProvider` or `AppServiceProvider` auto-discovers them (Laravel 12 uses auto-discovery by default — no manual registration needed unless `$policies` array is explicitly used).

**✅ Verification**: `php artisan route:list` should still return clean output with no errors.

### Step 1.3 — API Resources

```bash
git show architectural-refactoring:app/Http/Resources/PaymentResource.php
git show architectural-refactoring:app/Http/Resources/RentBillResource.php
git show architectural-refactoring:app/Http/Resources/TenantResource.php
git show architectural-refactoring:app/Http/Resources/PropertyResource.php
git show architectural-refactoring:app/Http/Resources/UnitResource.php
```
- Create each resource file.

> [!IMPORTANT]
> The `main` branch wraps all API responses with `{ data: ..., meta: ... }`. The Resource classes from `architectural-refactoring` may not include this wrapper. Do NOT change the existing response structure — just create the Resource transformer classes. The wrapper is applied at the controller level.

**✅ Verification**: `php artisan config:clear && php artisan optimize:clear` — no errors.

### Step 1.4 — RentBillService Bug Fix

```bash
git show architectural-refactoring:app/Services/RentBillService.php
```
- Compare the `calculateTotalOutstanding()` method with `main`'s version. Port only the bug fix, not a wholesale replacement of the file (since `main` may have additional changes).

### Phase 1 Commit
```bash
git add -A
git commit -m "feat(port): Phase 1 — Role enum, Policies, API Resources, RentBillService fix"
```

---

## Phase 2: Communication Layer — Notifications & Channels

**Goal**: Install `twilio/sdk`, create custom notification channels, and notification classes.

**Instruction to Agent:**
> Read Phase 2 of `REFACTORING_PHASES.md`. Do not install packages; first check if `twilio/sdk` is already in `composer.json`. Then create the notification infrastructure.

### Step 2.1 — Check & Install Twilio SDK

```bash
# Check if already installed
cat composer.json | grep twilio
```

If not present:
```bash
composer require twilio/sdk
```

### Step 2.2 — Notification Channels

```bash
git show architectural-refactoring:app/Channels/WhatsAppChannel.php
git show architectural-refactoring:app/Channels/ExpoPushChannel.php
```
- Create `app/Channels/WhatsAppChannel.php`
- Create `app/Channels/ExpoPushChannel.php`

### Step 2.3 — Notification Classes

```bash
git show architectural-refactoring:app/Notifications/PaymentReceived.php
git show architectural-refactoring:app/Notifications/RentBillGenerated.php
git show architectural-refactoring:app/Notifications/RentBillOverdue.php
```
- Create all three notification classes (all implement `ShouldQueue`).

### Step 2.4 — NotificationService

```bash
git show architectural-refactoring:app/Services/NotificationService.php
```
- Create `app/Services/NotificationService.php`.

### Step 2.5 — Twilio Config in services.php

```bash
git show architectural-refactoring:config/services.php
```
- Compare with `main`'s `config/services.php`. Add only the `twilio` array block.
- Also update `.env.example` by adding `TWILIO_SID=`, `TWILIO_TOKEN=`, `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`.

**✅ Verification**: `php artisan config:show services | grep -A 5 twilio` — should show twilio keys.

### Phase 2 Commit
```bash
git add -A
git commit -m "feat(port): Phase 2 — WhatsApp/Expo notification channels and ShouldQueue notification classes"
```

---

## Phase 3: Payment Gateway Integration

**Goal**: Port the full payment gateway abstraction, service rewrite, database migration, webhook controller, and event/listener.

> [!CAUTION]
> This is the most critical and complex phase. The agent must handle the `PaymentService` with extreme care — `main` branch may have its own modifications to payment logic. The agent must do a side-by-side comparison and port the gateway-specific logic, NOT overwrite main's entire service.

### Step 3.1 — Composer: DomPDF Dependency (install now for Phase 4)

```bash
cat composer.json | grep dompdf
```
If not present:
```bash
composer require barryvdh/laravel-dompdf
```

### Step 3.2 — config/payments.php

```bash
git show architectural-refactoring:config/payments.php
```
- Create `config/payments.php`.
- Add to `.env.example`:
  ```
  PAYMENTS_DEFAULT_GATEWAY=manual
  MPESA_CONSUMER_KEY=
  MPESA_CONSUMER_SECRET=
  MPESA_BUSINESS_SHORT_CODE=
  MPESA_PASSKEY=
  MPESA_CALLBACK_URL=
  MPESA_ENVIRONMENT=sandbox
  ```

### Step 3.3 — Gateway Interface & Drivers

```bash
git show architectural-refactoring:app/Contracts/PaymentGatewayInterface.php
git show architectural-refactoring:app/PaymentGateways/ManualGateway.php
git show architectural-refactoring:app/PaymentGateways/MpesaGateway.php
```
- Create `app/Contracts/PaymentGatewayInterface.php`
- Create `app/PaymentGateways/ManualGateway.php`
- Create `app/PaymentGateways/MpesaGateway.php`

### Step 3.4 — PaymentGatewayServiceProvider

```bash
git show architectural-refactoring:app/Providers/PaymentGatewayServiceProvider.php
```
- Create `app/Providers/PaymentGatewayServiceProvider.php`.
- Register it in `bootstrap/providers.php` (Laravel 12 way): add `App\Providers\PaymentGatewayServiceProvider::class` to the providers array.

**✅ Verification**: `php artisan config:show payments` — should list gateway config. `php artisan tinker --execute="app(App\Contracts\PaymentGatewayInterface::class);"` — should resolve without error.

### Step 3.5 — Database Migration

```bash
git show architectural-refactoring:database/migrations
```
Find the `add_gateway_fields_to_payments_table` migration file name, then:
```bash
git show architectural-refactoring:database/migrations/<exact_filename>.php
```
- Copy the migration file into `database/migrations/`.
- Run: `php artisan migrate` — confirm it runs without errors.

**✅ Verification**: Use `laravel-boost database-schema` MCP tool filtered to `payments` table to confirm the new columns are present.

### Step 3.6 — Update Payment Model

```bash
git show architectural-refactoring:app/Models/Payment.php
```
- Compare with `main`'s `Payment.php`. Add only the new gateway-related fields to `$fillable`:
  `gateway`, `checkout_request_id`, `gateway_reference`, `gateway_status`, `gateway_metadata`, `gateway_confirmed_at`, `receipt_path`.

### Step 3.7 — Event & Listener

```bash
git show architectural-refactoring:app/Events/PaymentConfirmed.php
git show architectural-refactoring:app/Listeners/ProcessPaymentConfirmed.php
```
- Create `app/Events/PaymentConfirmed.php`
- Create `app/Listeners/ProcessPaymentConfirmed.php`

### Step 3.8 — Webhook Route & Controller

```bash
git show architectural-refactoring:routes/webhooks.php
git show architectural-refactoring:app/Http/Controllers/Webhook/MpesaWebhookController.php
```
- Create `routes/webhooks.php`
- Create `app/Http/Controllers/Webhook/MpesaWebhookController.php`
- Edit `bootstrap/app.php`: Register the webhook route file. Look at how `main`'s `bootstrap/app.php` registers routes, and add the webhooks registration in the same pattern.

**✅ Verification**: `php artisan route:list | grep webhook` — should show the M-Pesa callback route.

### Step 3.9 — PaymentService Rewrite

```bash
git show architectural-refactoring:app/Services/PaymentService.php
```
- Read `main`'s current `PaymentService.php` and the source version.
- Port the gateway dispatch logic and idempotency window into `main`'s version.
- Ensure the `load()` relationship eager-loading (Phase 5 fix) is included.

> [!IMPORTANT]
> After porting `PaymentService`, do NOT replace the controllers yet. Run verification first.

**✅ Verification**: `php artisan route:list --path=api/v1` — all 73+ routes must still be visible. `php artisan optimize:clear` — no errors.

### Step 3.10 — Thin Down Controllers

```bash
git show architectural-refactoring:app/Http/Controllers/Api/Tenant/PaymentsController.php
git show architectural-refactoring:app/Http/Controllers/Api/Landlord/PaymentController.php
```
- Read both and compare with `main`'s versions.
- Port the delegation pattern to `PaymentService`, but preserve the `data`/`meta` response wrapping that `main` introduced.
- Add `syncPaymentWithRentBill` method to `RentBillService` by reading:
  ```bash
  git show architectural-refactoring:app/Services/RentBillService.php
  ```

### Phase 3 Commit
```bash
git add -A
git commit -m "feat(port): Phase 3 — Payment gateway abstraction, M-Pesa webhook, events, DB migration"
```

---

## Phase 4: Receipt Generation & Storage

**Goal**: Port the `ReceiptService`, Blade PDF template, and receipt endpoints.

### Step 4.1 — ReceiptService

```bash
git show architectural-refactoring:app/Services/ReceiptService.php
```
- Create `app/Services/ReceiptService.php` exactly as-is.

### Step 4.2 — Blade Template

```bash
git show architectural-refactoring:resources/views/receipts/payment.blade.php
```
- Create `resources/views/receipts/payment.blade.php`.
- The template uses null-safe operators (`?->`) throughout — ensure they are all preserved (Phase 5 fix is already baked in).

### Step 4.3 — Receipt Endpoints

```bash
git show architectural-refactoring:routes/api.php
```
- Find the `GET /payments/{id}/receipt` route definitions under both Tenant and Landlord API groups.
- Add them to `main`'s `routes/api.php` in the same positions.
- Add `receipt()` methods to both `PaymentsController` and `PaymentController`:
  ```bash
  git show architectural-refactoring:app/Http/Controllers/Api/Tenant/PaymentsController.php
  git show architectural-refactoring:app/Http/Controllers/Api/Landlord/PaymentController.php
  ```

**✅ Verification**:
```bash
php artisan route:list | grep receipt
# Should show both tenant and landlord receipt routes

php artisan tinker --execute="app(App\Services\ReceiptService::class);"
# Should resolve without error
```

### Phase 4 Commit
```bash
git add -A
git commit -m "feat(port): Phase 4 — ReceiptService, DomPDF blade template, receipt API endpoints"
```

---

## Phase 5: Code Review Remediations

**Goal**: Apply all the critical bug fixes identified during the code review phase.

**Instruction to Agent:**
> Read Phase 5 of `REFACTORING_PHASES.md` carefully. This phase is about **fixes**, not new features. Apply each fix one by one to the files listed.

### Step 5.1 — AppServiceProvider: Wire the Event

```bash
git show architectural-refactoring:app/Providers/AppServiceProvider.php
```
- In `main`'s `AppServiceProvider.php`, add the event binding:
  ```php
  use App\Events\PaymentConfirmed;
  use App\Listeners\ProcessPaymentConfirmed;
  // ...
  Event::listen(PaymentConfirmed::class, ProcessPaymentConfirmed::class);
  ```

**✅ Verification**: `php artisan event:list | grep PaymentConfirmed` — must show the listener binding.

### Step 5.2 — PaymentResource: Null-safe Fallbacks & Gateway Exposure

```bash
git show architectural-refactoring:app/Http/Resources/PaymentResource.php
```
- Compare with `main`'s `PaymentResource.php`. Port the null-coalescing fallbacks and the gateway/receipt field additions. Preserve `main`'s `data`/`meta` wrapper if it applies.

### Step 5.3 — ProcessPaymentConfirmed: Fix Status Derivation

```bash
git show architectural-refactoring:app/Listeners/ProcessPaymentConfirmed.php
```
- Ensure the listener does NOT hardcode `$payment->update(['status' => 'paid'])`.
- Status must be derived from the linked `RentBill` or `UtilityBill` status after sync.

### Step 5.4 — RentBillService: Double-Crediting Guard

```bash
git show architectural-refactoring:app/Services/RentBillService.php
```
- Confirm `syncPaymentWithRentBill` has the `if ($payment->status !== 'pending') return;` guard at its entry.

### Step 5.5 — Mobile TypeScript Types

```bash
git show architectural-refactoring:mobile/src/types/index.ts
```
- Compare with `main`'s `mobile/src/types/index.ts`.
- Port the updated `Payment` interface fields: `gateway`, `gateway_status`, `gateway_reference`, `receipt_path`.
- Preserve any new types that `main` introduced (the `data`/`meta` wrapper interfaces, etc.).

### Step 5.6 — Mobile API Clients: getPaymentReceipt

```bash
git show architectural-refactoring:mobile/src/api/tenant.ts
git show architectural-refactoring:mobile/src/api/landlord.ts
```
- Add `getPaymentReceipt(paymentId: number)` wrapper functions to both API clients.
- Adapt the endpoint path to match `main`'s API client pattern (especially regarding the `data`/`meta` response unwrapping).

### Phase 5 Commit
```bash
git add -A
git commit -m "fix(port): Phase 5 — Event wiring, status derivation, double-credit guard, PaymentResource null-safety, mobile types"
```

---

## Final Verification Sequence

Run these in order. Do not proceed to the PR until all pass.

### 1. Backend Route Audit
```bash
php artisan route:list --path=api/v1 | grep -E "(payment|receipt|webhook)"
```
**Expected**: Tenant payment routes, Landlord payment routes, receipt endpoints for both, M-Pesa webhook callback route.

### 2. Event Binding Audit
```bash
php artisan event:list | grep -i payment
```
**Expected**: `PaymentConfirmed` → `ProcessPaymentConfirmed`.

### 3. Config Audit
```bash
php artisan config:show payments
```
**Expected**: Shows `default_gateway`, `mpesa.*` keys.

### 4. Database Audit (via laravel-boost MCP)
Use the `database-schema` tool filtered to `payments` and confirm presence of:
`gateway`, `checkout_request_id`, `gateway_reference`, `gateway_status`, `gateway_metadata`, `gateway_confirmed_at`, `receipt_path`.

### 5. Container Resolution
```bash
php artisan tinker --execute="
echo get_class(app(App\Contracts\PaymentGatewayInterface::class));
echo get_class(app(App\Services\PaymentService::class));
echo get_class(app(App\Services\ReceiptService::class));
"
```
**Expected**: All three resolve to their concrete class names without errors.

### 6. Run Backend Tests
```bash
php artisan test
```
**Expected**: All existing tests pass. No new failures.

### 7. Mobile TypeScript Check
```bash
cd mobile && npx tsc --noEmit
```
**Expected**: Zero TypeScript errors.

---

## Create Pull Request (via GitHub MCP)

Once all verification steps pass:

```
Use the mcp_github_create_pull_request tool with:
- owner: luisosena
- repo: estate-practice
- head: port/payment-architecture
- base: main
- title: "feat: Port Payment Architecture (Phases 1-5) from architectural-refactoring to main"
- body: (use the template below)
```

**PR Body Template:**
```markdown
## Summary
Ports the Payment Architecture refactoring (Phases 1-5) from the `architectural-refactoring` branch onto `main`.

This is a systematic **porting** (not a git merge) to avoid conflict corruption between two independently-evolved branches.

## Changes by Phase
- **Phase 1**: Role enum, Policies, API Resources, RentBillService bug fix
- **Phase 2**: WhatsApp/Expo notification channels, ShouldQueue notification classes
- **Phase 3**: PaymentGatewayInterface, ManualGateway, MpesaGateway, PaymentService rewrite, DB migration (gateway fields), MpesaWebhookController, PaymentConfirmed event + listener
- **Phase 4**: ReceiptService (DomPDF), receipt Blade template, receipt API endpoints
- **Phase 5**: Event wiring, status derivation fix, double-crediting guard, PaymentResource null-safety, mobile type updates

## Preserved from `main`
- `data`/`meta` API response wrapper shape
- Mobile Jest test infrastructure
- All existing routes and their authentication guards

## Testing
- [ ] `php artisan route:list` — no errors
- [ ] `php artisan event:list` — PaymentConfirmed → ProcessPaymentConfirmed wired
- [ ] `php artisan config:show payments` — gateway config visible
- [ ] DB schema — 7 new gateway columns on `payments` table
- [ ] `php artisan test` — all tests pass
- [ ] `npx tsc --noEmit` (mobile) — zero TypeScript errors

## Docs
Reference: `docs/projectsummary/REFACTORING_PHASES.md`
```

---

## Guardrails & Rules for the Agent

1. **Never use `git merge`** — porting only, one phase at a time.
2. **Never touch `main` directly** — all work happens on `port/payment-architecture`.
3. **Read before writing** — always run `git show architectural-refactoring:<file>` before recreating a file.
4. **Commit after each phase** — one commit per phase, not one giant commit at the end.
5. **Verify before proceeding** — do not start Phase N+1 until all verifications from Phase N pass.
6. **Preserve `main`'s response shape** — the `data`/`meta` API wrapper is a `main`-only convention; do not replace it.
7. **Use `laravel-boost` MCP** for: reading DB schema, checking last error, verifying config, reading logs.
8. **Use `github` MCP** for: reading source files from `architectural-refactoring` when the `git show` output is large, creating the final PR.
