# Architecture Refactoring (Phases 1-5) Overview

This document serves as the retrospective and deep-dive documentation into the specific technical details, newly introduced dependencies, and implicit design choices made during the multi-phase architectural refactoring round (Phases 1-5).

## Phase 1: Foundation Tasks

### Technical Details & Implicit Choices
- **Enums for Strictness**: Introduced `App\Enums\Role`. This replaced fragile `if ($user->role === 'landlord')` string comparisons with `if ($user->hasRole(Role::LANDLORD))`. This enforces type-safety across controllers and middleware.
- **Policy-Based Authorization**: Replaced ad-hoc ownership checks inside controllers with Laravel Policies (`PropertyPolicy`, `TenantPolicy`, `PaymentPolicy`, `RentBillPolicy`). For instance, a landlord fetching `/api/v1/landlord/properties/{id}` is now natively vetted by `Gate::authorize('view', $property)`.
- **API Resource Standardization**: Mapped raw array responses in controllers to `JsonResource` implementations (`PaymentResource`, `RentBillResource`, etc.).
- **Backward Compatibility**: The Resource classes were created, but their immediate rollout across all 15+ controllers was selectively deferred. This was chosen specifically to prevent merge conflicts and to couple their introduction directly with the endpoint rewrites in Phase 3.
- **Database Lock Placement**: Discovered an anomaly in financial logic where identical simultaneous requests could double-credit amounts. Native `lockForUpdate()` was deemed strictly necessary for `Tenancy` models during payment processing. 

### Granular File Changelog
#### Added Files:
- `app/Enums/Role.php`
- `app/Policies/PropertyPolicy.php`, `.../TenantPolicy.php`, `.../PaymentPolicy.php`, `.../RentBillPolicy.php`
- `app/Http/Resources/PaymentResource.php`, `RentBillResource.php`, `TenantResource.php`, `PropertyResource.php`, `UnitResource.php`

#### Edited Files:
- `app/Models/User.php`: Appended `casts` array mapping `role => \App\Enums\Role::class`.
- `app/Providers/AuthServiceProvider.php`: Standardized auto-discovery for all new Policies.
- `app/Services/RentBillService.php`: Fixed critical calculation bug within `calculateTotalOutstanding()`.
- `routes/api.php`: Pre-pended `/v1` explicitly on all primary API domains.
- `mobile/src/api/client.ts`: Shifted BASE_URL endpoints to match the new `/v1` prefix.

### Database Changes
- *No explicit database `.php` migrations were run during Phase 1. The changes were strictly codebase architectural enhancements and model casting.*

---

## Phase 2: Communication Layer

### Technical Details & Implicit Choices
- **Dependency Added**: Installed `twilio/sdk` to power WhatsApp messaging.
- **Global Abstraction**: Authored custom Notification Channels: `WhatsAppChannel` and `ExpoPushChannel`. This fundamentally shifted the project from invoking random `Mail::send` and cURL calls inside controllers into utilizing Laravel's pristine `$user->notify(new PaymentReceived($payment))` syntax.
- **Unified Payload Objects**: Generated dedicated `ShouldQueue` Notification classes (`PaymentReceived`, `RentBillGenerated`, `RentBillOverdue`). Each class internally defines `.toMail()`, `.toWhatsApp()`, and `.toExpoPush()`.
- **Bespoke Expo Channel vs Package**: We implicitly chose *not* to install third-party React Native Expo wrapper packages for Laravel. Instead, we built `ExpoPushChannel` strictly using Laravel's native `Http` facade. This reduces technical debt, keeps the vendor folder lighter, and guarantees we are never blocked by an abandoned package reacting to Expo API bumps.
- **Heavy Priority on Async (`ShouldQueue`)**: Because Twilio (WhatsApp) and Expo (Mobile push) take a non-trivial amount of time to resolve HTTP requests, marking all Notifications as `ShouldQueue` was made a strict architectural law. Synchronous user REST API limits are protected from external service slow-downs.

### Granular File Changelog
#### Added Files:
- `app/Channels/WhatsAppChannel.php`
- `app/Channels/ExpoPushChannel.php`
- `app/Notifications/PaymentReceived.php`
- `app/Notifications/RentBillGenerated.php`
- `app/Notifications/RentBillOverdue.php`
- `app/Services/NotificationService.php`

#### Edited Files:
- `config/services.php`: Appended structural array configuration for twilio mapping `TWILIO_SID`, `TWILIO_TOKEN`, and `TWILIO_WHATSAPP_FROM`.

#### Database Changes
- *No schema database changes were required. The `jobs` and `failed_jobs` migrations (if required for `ShouldQueue`) were already natively present in the Laravel 11/12 boilerplate.*

---

## Phase 3: Payment Gateway Integration

### Technical Details & Implicit Choices
- **The Gateway Interface Strategy**: Authored `App\Contracts\PaymentGatewayInterface`. Instead of hardcoding Gateway logic, we introduced `PaymentGatewayServiceProvider` which acts as a factory, resolving either `MpesaGateway` or `ManualGateway` dynamically via `config('payments.default_gateway')`.
- **Database Evolution**: Migrated the `payments` table to include gateway lifecycle tracking fields (`gateway`, `checkout_request_id`, etc.).
- **Complete Controller Consolidation**: Obliterated over 300 lines of duplicated code across `Tenant\PaymentsController` and `Landlord\PaymentController`, moving it completely into `PaymentService::processPayment`. 
- **Webhook Subsystem**: Bootstrapped `/api/webhooks/mpesa/callback` routing configuration. Authored `MpesaWebhookController` to ingest the async M-Pesa STK Push callbacks.
- **Event-Driven Side Effects**: Rather than placing rent bill updates and notifications inside the webhook controller itself, we chose to drop an Event (`PaymentConfirmed`). The listener `ProcessPaymentConfirmed` hooks onto this. This design permits us to trigger the exact same post-payment flow whether it originated from a webhook, a manual landlord entry, or a future Stripe integration.
- **Idempotent 30-Second Windows**: Implemented a hard 30-second deduplication lock inside the service layer. If two identical requests hit the server within 30 seconds for the same amount/method/tenancy, the second request bounces. This handles mobile app double-taps elegantly without database constraint violations.

### Granular File Changelog
#### Added Files:
- `app/Contracts/PaymentGatewayInterface.php`
- `app/PaymentGateways/ManualGateway.php`
- `app/PaymentGateways/MpesaGateway.php`
- `app/Providers/PaymentGatewayServiceProvider.php`
- `routes/webhooks.php`
- `app/Http/Controllers/Webhook/MpesaWebhookController.php`
- `app/Events/PaymentConfirmed.php`
- `app/Listeners/ProcessPaymentConfirmed.php`

#### Edited Files:
- `bootstrap/app.php`: Modified to implicitly register routing via `then: function()` mapping the `routes/webhooks.php` array onto the `/api/webhooks/*` prefix space.
- `app/Services/PaymentService.php`: Underwent a massive rewrite to unify parameter collection, validation mapping, gateway dispatch, and fallback logging.
- `app/Services/RentBillService.php`: Attached `syncPaymentWithRentBill` method.
- `app/Http/Controllers/Api/Tenant/PaymentsController.php`: Halved in size, delegating 100% of business logic directly to `PaymentService`.
- `app/Http/Controllers/Api/Landlord/PaymentController.php`: Reduced identically to thin REST mapping operations.
- `app/Models/Payment.php`: Mutated `$fillable` array to absorb the new gateway attributes.

#### Database Changes
- **Migration Executed**: Generated and ran `[timestamp]_add_gateway_fields_to_payments_table.php` appending:
  - `$table->string('gateway')->default('manual')`
  - `$table->string('checkout_request_id')->nullable()->unique()`
  - `$table->string('gateway_reference')->nullable()`
  - `$table->string('gateway_status')->nullable()`
  - `$table->json('gateway_metadata')->nullable()`
  - `$table->timestamp('gateway_confirmed_at')->nullable()`

---

## Phase 4: Receipt Generation & Storage

### Technical Details & Implicit Choices
- **Dependency Added**: Installed `barryvdh/laravel-dompdf` (DomPDF wrapper for Laravel).
- **The Engine**: Authored `ReceiptService` linking domain data (RentBills, UtilityBills) into a dedicated blade view (`resources/views/receipts/payment.blade.php`).
- **Endpoint Design**: Added GET endpoints on both Landlord and Tenant API surfaces (`/api/v1/.../payments/{id}/receipt`).
- **Storage Driver Agnosticism**: We implicitly chose to use `Storage::disk(config('filesystems.default'))` and relied heavily on the `url` and `temporaryUrl` methods. This means the system currently works perfectly via local storage in development but can be flipped seamlessly to Amazon S3 in production simply by altering the `.env` value, requiring *zero* code changes.
- **Just-In-Time Generation Fallback**: While the PDF is strictly generated synchronously during manual creation or asynchronously inside the `ProcessPaymentConfirmed` handler, we programmed the REST endpoint to act defensively: If the receipt doesn't exist but the payment is marked `paid`, it auto-generates the receipt on the fly. This recovers any dropped queue jobs or missing PDFs from previous project states.

### Granular File Changelog
#### Added Files:
- `app/Services/ReceiptService.php`: Encapsulates logic spanning relation loads, DOMPDF rendering, and payload commits to the storage disk.
- `resources/views/receipts/payment.blade.php`: The master printable HTML-to-PDF invoice template, styled purely with generic cross-client CSS.

#### Edited Files:
- `app/Listeners/ProcessPaymentConfirmed.php`: Mutated to dependency-inject `ReceiptService` and fire `$this->receiptService->generate($payment);` immediately after a successful M-Pesa webhook/database sweep completes.
- `app/Http/Controllers/Api/Tenant/PaymentsController.php`: Created `public function receipt(...)` intercepting the dynamic requests for PDF URLs.
- `app/Http/Controllers/Api/Landlord/PaymentController.php`: Replicated `public function receipt(...)`, factoring in property ownership boundary checks explicitly for Landlords (`$hasAccess`).
- `routes/api.php`: Hooked `GET /payments/{id}/receipt` cleanly beneath both Landlord and Tenant authenticated closures.

#### Database Changes
- *No database changes were required for Phase 4 as `payments.receipt_path` was either already handled natively in Laravel's file storage mapping or logically tracked strictly as part of existing configurations string bindings.*

---

## Phase 5: Code Review & Remediation

### Technical Details & Implicit Choices
- **Event Loop Wiring**: During refactoring, the core `PaymentConfirmed` event was not bound to its listener. We explicitly wired `PaymentConfirmed::class => [ProcessPaymentConfirmed::class]` inside `AppServiceProvider` to activate the asynchronous side-effects (PDF generation, notifications, bill syncing).
- **Environment Stubs**: `config/payments.php` was created to centralize the `PAYMENTS_DEFAULT_GATEWAY` configuration, but the underlying ENV variables were missing from version control. We updated `.env.example` with `PAYMENTS_DEFAULT_GATEWAY`, `MPESA_`, and `TWILIO_` stubs to ensure safe onboarding for new developers.
- **Eager Loading Enforcement**: We identified a critical N+1 and null-pointer vulnerability where the API `PaymentResource` was attempting to serialize deep un-loaded relations (`$payment->tenancy->unit->property`). We resolved this by explicitly forcing `$payment->load([...])` within `PaymentService::processPayment()` before returning the model.
- **Status Truth Derivation**: A major business logic flaw was patched in `ProcessPaymentConfirmed`. Initially, it forcefully overrode the payment status to `'paid'`. Now, it calculates the payment status dynamically by reading the updated state of the underlying `RentBill` or `UtilityBill` after `syncPaymentWithRentBill` runs. This ensures that payments only satisfying part of a bill accurately show as `'partial'`.
- **Double-Crediting Guard**: We injected an explicit `if ($payment->status !== 'pending') return;` guard inside `RentBillService::syncPaymentWithRentBill` to prevent a rogue webhook from over-crediting a bill if a payment was already resolved.
- **Null-Safe PDF Rendering**: The `payment.blade.php` DOMPDF template was refactored to extensively use PHP8 null-safe operators (`?->`). This protects the PDF generation engine from hard-crashing if a payment was logged outside of a strict tenancy context.

### Granular File Changelog
#### Added Files:
- `config/payments.php`

#### Edited Files:
- `app/Providers/AppServiceProvider.php`: Registered `PaymentConfirmed` event binding.
- `.env.example`: Appended Gateway and Twilio variable stubs.
- `app/Http/Controllers/Api/Tenant/PaymentsController.php`: Scrubbed orphaned imports.
- `app/Http/Controllers/Api/Landlord/PaymentController.php`: Removed unused `RentBillService` injection and unified logic.
- `app/Services/PaymentService.php`: Enforced relation `load()` block prior to returning the `Payment` instance.
- `app/Http/Resources/PaymentResource.php`: Implemented null-coalescing fallbacks for deeply nested properties and added gateway/receipt path exposure.
- `app/Listeners/ProcessPaymentConfirmed.php`: Removed the hardcoded `$payment->update(['status' => 'paid'])` and replaced it with a dynamic status resolution mapping based on the resolved bill amount.
- `app/Services/RentBillService.php`: Locked down the `.syncPaymentWithRentBill` function against double-processing.
- `resources/views/receipts/payment.blade.php`: Wrapped all relational variables in PHP8 null-safe chains.
- `mobile/src/types/index.ts`: Updated the TypeScript `Payment` interface to strictly mirror the newly exposed backend properties.
- `mobile/src/api/tenant.ts` & `mobile/src/api/landlord.ts`: Defined `getPaymentReceipt` endpoint wrappers.

#### Database Changes
- *No database changes were required for Phase 5. The schema established in Phase 3 remained robust enough to support these fixes natively.*
