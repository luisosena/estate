## Estate Practice – Project Overview

### 1. Summary

**Estate Practice** is a Laravel 12 application that serves two distinct surfaces:
- A **web SPA** (Inertia.js + React 19 + TypeScript) for administration and web access.
- A **REST API** (`/api/v1/*`) consumed by a cross-platform **Expo/React Native mobile app** for landlords and tenants.

The system is a property management platform supporting three roles: **Admin**, **Landlord**, and **Tenant**. The backend has been refactored (Phases 1–4, Q2 2026) from a monolithic controller architecture into a **service-oriented, event-driven** architecture with a consolidated payment gateway abstraction, async webhook processing, and automated PDF receipt generation.

---

### 2. Tech Stack 

- **Backend**
  - **Language**: PHP ^8.2
  - **Framework**: Laravel ^12.0 (`laravel/framework`)
  - **SPA adapter**: `inertiajs/inertia-laravel` ^2.0
  - **Authentication & security**:
    - `laravel/fortify` ^1.30 for auth flows (registration, username-based login for mobile, password reset, email verification, 2FA)
    - Token-based API authentication for mobile (`/api/v1/*`)
  - **Payment Integrations** *(added Phase 3–4)*:
    - `barryvdh/laravel-dompdf` ^3.1 — PDF receipt generation
    - `twilio/sdk` ^8.3 — WhatsApp and SMS notifications
  - **Routing & URLs**:
    - `laravel/wayfinder` ^0.1.9
    - `tightenco/ziggy` ^2.6
  - **Dev & tooling**:
    - `laravel/tinker` (REPL)
    - `laravel/pail` (log viewer)
    - `laravel/sail` (optional Docker dev env)
    - `laravel/pint` (PHP linter/formatter)
    - `pestphp/pest` + `pestphp/pest-plugin-laravel` (testing)

- **Frontend**
  - **Language & runtime**:
    - TypeScript ^5.7.2
    - React ^19.2.0 (`react`, `react-dom`)
  - **Bundler/dev server**:
    - Vite ^7.0.4 with `@vitejs/plugin-react`
    - `laravel-vite-plugin` and `@laravel/vite-plugin-wayfinder` for Laravel integration
  - **SPA framework**:
    - `@inertiajs/react` ^2.3.7
  - **Styling & UI**:
    - Tailwind CSS ^4.0.0 with `@tailwindcss/vite`
    - Glassmorphism component libraries: `@yhooi2/shadcn-glass-ui`, `glasscn-ui`
    - Animation: `framer-motion`, `motion`, `tw-animate-css`
    - Theming: `next-themes`
    - Icons: `lucide-react`, `@tabler/icons-react`
    - Headless primitives: `@radix-ui/react-*` (dialogs, dropdowns, navigation, toggle, tooltip, etc.)
    - Tables & charts: `@tanstack/react-table`, `recharts`
    - DnD: `@dnd-kit/*`
    - Notifications: `sonner`
  - **Validation & types**:
    - `zod`
    - Local type declarations under `resources/js/types`

- **Tooling & Quality**
  - **JS/TS**
    - ESLint 9 (`eslint`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import`, `eslint-import-resolver-typescript`)
    - Prettier 3 with `prettier-plugin-tailwindcss` and `prettier-plugin-organize-imports`
    - `typescript-eslint`
  - **PHP**
    - Laravel Pint for coding style
  - **Test runner**
    - Pest (feature + unit tests)

---

### 3. Project Scripts
 
- **Composer (`composer.json`)**
  - **`setup`**: install PHP deps, create `.env` if missing, generate app key, run migrations, install npm deps, build assets.
  - **`dev`**: disable Composer timeout, then run:
    - `php artisan serve`
    - `php artisan queue:listen --tries=1`
    - `npm run dev` (Vite)
  - **`dev:ssr`**: build SSR assets, then run:
    - `php artisan serve`
    - `php artisan queue:listen --tries=1`
    - `php artisan pail --timeout=0`
    - `php artisan inertia:start-ssr`
  - **`lint` / `test:lint`**: run Pint (with/without `--test`)
  - **`test`**: clear config, run Pint in test mode, then `php artisan test`.

- **NPM (`package.json`)**
  - **`dev`**: `vite`
  - **`build`**: `vite build`
  - **`build:ssr`**: `vite build && vite build --ssr`
  - **`lint`**: `eslint . --fix`
  - **`format`**: `prettier --write resources/`
  - **`format:check`**: `prettier --check resources/`
  - **`types`**: `tsc --noEmit`

---

### 4. High-Level Directory Structure

#### Root

- **`artisan`**: Laravel CLI entrypoint.
- **`composer.json` / `composer.lock`**: PHP dependencies and scripts.
- **`package.json` / `package-lock.json`**: JS/TS dependencies and scripts.
- **`tailwind.config.js`**: Tailwind CSS 4 configuration.
- **`vite.config.ts`**: Vite build/dev server configuration.
- **`.editorconfig`, `.prettierrc`, `.prettierignore`**: formatting rules.
- **`.gitattributes`, `.gitignore`**: Git configuration and ignore rules.
- **`.env.example`**: environment template.
- **`phpunit.xml`**: test configuration for PHP/Pest.

#### `app/` – Laravel application

- **`Actions/Fortify`**
  - `CreateNewUser.php`, `ResetUserPassword.php`: Fortify hooks for user creation and password reset.

- **`Concerns`**
  - `PasswordValidationRules.php`, `ProfileValidationRules.php`: reusable validation traits.

- **`Contracts`** *(new — Phase 3)*
  - `PaymentGatewayInterface.php`: interface for all payment gateway drivers.

- **`Enums`** *(new — Phase 1)*
  - `Role.php`: `enum Role: string { ADMIN, LANDLORD, TENANT }` — standardised role values.

- **`Events`** *(new — Phase 3)*
  - `PaymentConfirmed.php`: dispatched by webhook controller after M-Pesa callback confirms a payment.

- **`Http/Controllers`**
  - `Controller.php`: base controller.
  - `Api/Auth/`: login, register, logout, user endpoints.
  - `Api/Landlord/`: `PaymentController`, `RentBillController`, `TenantController`, `PropertyController`, `UnitController`, `TenancyUtilityController`, `UtilityBillController`, `UtilityTypeController`, `DashboardController`, `NotificationController`, `ProfileController`.
  - `Api/Tenant/`: `PaymentsController`, `RentBillController`, `UtilitiesController`, `DashboardController`, `ProfileController`.
  - `Api/UserController`, `Api/PasswordController`: shared endpoints.
  - `Webhook/MpesaWebhookController.php` *(new — Phase 3)*: handles M-Pesa STK push callbacks and fires `PaymentConfirmed`.

- **`Http/Resources`** *(new — Phase 1)*
  - `PaymentResource.php`: standardised JSON transformer for `Payment` models.
  - `RentBillResource.php`: standardised JSON transformer for `RentBill` models.

- **`Listeners`** *(new — Phase 3)*
  - `ProcessPaymentConfirmed.php`: queued listener that syncs rent/utility bills, generates receipts, and sends notifications after a gateway confirms a payment.

- **`Models`**
  - `User.php`, `Tenant.php`, `Property.php`, `Unit.php`, `Tenancy.php`.
  - `Payment.php`: gateway columns added (`gateway`, `checkout_request_id`, `gateway_reference`, `gateway_status`, `gateway_metadata`, `gateway_confirmed_at`, `receipt_path`).
  - `RentBill.php`, `UtilityBill.php`, `UtilityType.php`, `TenancyUtility.php`.

- **`Notifications`** *(new — Phase 2)*
  - `PaymentReceived.php`, `RentBillGenerated.php`, `RentBillOverdue.php`: all implement `ShouldQueue`; delivered via `database`, `WhatsAppChannel`, and `ExpoPushChannel`.

- **`Notifications/Channels`** *(new — Phase 2)*
  - `WhatsAppChannel.php`: sends messages via Twilio WhatsApp API.
  - `ExpoPushChannel.php`: sends push notifications to the Expo mobile app.

- **`PaymentGateways`** *(new — Phase 3)*
  - `ManualGateway.php`: synchronous/manual payment driver — instantly resolves to `success`.
  - `MpesaGateway.php`: async M-Pesa STK push driver — initiates STK push, waits for webhook callback.

- **`Policies`** *(new — Phase 1)*
  - `PaymentPolicy.php`: enforces ownership-based authorisation for payment actions.

- **`Rules`**
  - `UtilityBillBelongsToTenancy.php`: validation rule ensuring utility bills belong to the correct tenancy.

- **`Services`**
  - `PaymentService.php` *(refactored — Phase 3)*: single source of truth for all payment processing. Implements a 30-second idempotency window and pluggable `PaymentGatewayInterface`.
  - `ReceiptService.php` *(new — Phase 4)*: generates PDF receipts via DomPDF and stores them using the `Storage` facade (local or cloud-agnostic).
  - `NotificationService.php` *(new — Phase 2)*: thin facade over Laravel notification dispatch for payment and rent bill events.
  - `RentBillService.php`: manages rent bill creation, payment linking, sync, and automatic overdue marking.
  - `UtilityService.php`: manages utility connections and bill processing.
  - `TenantService.php`: tenant onboarding with atomic user + tenancy creation.
  - `DocSyncService.php`: documentation sync utilities.

- **`Providers`**
  - `AppServiceProvider.php` *(updated)*: registers `DocSyncService` singleton; registers `PaymentConfirmed → ProcessPaymentConfirmed` event binding; forces HTTPS in production.
  - `FortifyServiceProvider.php`: Fortify configuration (features, views, actions).
  - `PaymentGatewayServiceProvider.php` *(new — Phase 3)*: binds `PaymentGatewayInterface` to the correct driver based on `PAYMENTS_DEFAULT_GATEWAY` env var.

- **`dashboard/data.json`**
  - Seed/fixture data for dashboard UI (cards, charts, etc.).

#### `config/`

- Standard Laravel config: `app.php`, `auth.php`, `cache.php`, `database.php`, `filesystems.php`, `fortify.php`, `inertia.php`, `logging.php`, `mail.php`, `queue.php`, `services.php`, `session.php`.
- **`payments.php`** *(new — Phase 3)*: payment gateway configuration — `default_gateway` (manual/mpesa) and `mpesa.*` credentials, all read from environment variables.

#### `database/`

- **`migrations`**
  - `0001_01_01_000000_create_users_table.php`: base `users` table.
  - `0001_01_01_000001_create_cache_table.php`: cache storage.
  - `0001_01_01_000002_create_jobs_table.php`: queue jobs.
  - `2025_08_26_100418_add_two_factor_columns_to_users_table.php`: 2FA columns on `users`.
  - `2026_01_21_102634_create_tenants_table.php`: tenants schema.
  - `2026_03_20_000001_create_utility_types_table.php`: utility types catalog.
  - `2026_03_20_000002_create_tenancy_utilities_table.php`: tenancy utility assignments.
  - `2026_03_20_000003_create_utility_bills_table.php`: monthly utility bills.
  - `2026_03_20_000004_add_utility_bill_id_to_payments_table.php`: links payments to utility bills.
- **`factories/UserFactory.php`**: user factory.
- **`seeders/DatabaseSeeder.php`**: database seeding entrypoint.
- **`seeders/UtilityTypeSeeder.php`**: seeds default utility types (Water, Electricity, Gas, Internet, Security, Janitor, Garbage, Parking).

#### `resources/`

- **`css/app.css`**: Tailwind and global styles.
- **`views/app.blade.php`**: Inertia root Blade view that mounts the React app.

- **`js/`** – main React/Inertia SPA
  - **Entry & SSR**
    - `app.tsx`: client entry point, initializes Inertia and React.
    - `ssr.tsx`: server-side rendering entry for Inertia SSR.

  - **`pages/`** – Inertia pages (mapped from Laravel routes)
    - `auth/confirm-password.tsx`
    - `auth/forgot-password.tsx`
    - `auth/login.tsx`
    - `auth/register.tsx`
    - `auth/reset-password.tsx`
    - `auth/two-factor-challenge.tsx`
    - `auth/verify-email.tsx`
    - `dashboard.tsx` (authenticated dashboard; receives `tenants`)
    - `landlordDashboard.tsx` (landlord view)
    - `tenantDashboard.tsx` (tenant-specific view; receives `tenant`)
    - `testDashboard.tsx` (experimental dashboard)
    - `mail.tsx` (mail-like view)
    - `settings/appearance.tsx`
    - `settings/password.tsx`
    - `settings/profile.tsx`
    - `settings/two-factor.tsx`
    - `welcome.tsx` (landing page; uses `canRegister` flag)

  - **`components/`** – shared React components
    - App shell: `app-shell.tsx`, `app-header.tsx`, `app-sidebar.tsx`, `app-sidebar-header.tsx`, `app-content.tsx`, `site-header.tsx`.
    - Navigation: `nav-main.tsx`, `nav-secondary.tsx`, `nav-projects.tsx`, `nav-documents.tsx`, `nav-footer.tsx`, `nav-user.tsx`, `mail-sidebar.tsx`, `team-switcher.tsx`, `breadcrumbs.tsx`.
    - Domain/utility: `data-table.tsx`, `chart-area-interactive.tsx`, `section-cards.tsx`, `user-info.tsx`, `user-menu-content.tsx`.
    - Settings/auth helpers: `delete-user.tsx`, `two-factor-setup-modal.tsx`, `two-factor-recovery-codes.tsx`, `alert-error.tsx`, `input-error.tsx`.
    - Branding/typography: `app-logo.tsx`, `app-logo-icon.tsx`, `heading.tsx`, `heading-small.tsx`, `text-link.tsx`.
    - **`animate-ui/`**: animation primitives and icons (e.g. `animate/primitives/slot.tsx`, dashboard icons).
    - **`ui/`**: local design system:
      - Inputs: `input.tsx`, `checkbox.tsx`, `switch.tsx`, `input-otp.tsx`, `label.tsx`.
      - Layout & containers: `card.tsx`, `sidebar.tsx`, `sheet.tsx`, `drawer.tsx`, `tabs.tsx`, `table.tsx`, `breadcrumb.tsx`, `navigation-menu.tsx`, `separator.tsx`.
      - Feedback: `alert.tsx`, `badge.tsx`, `skeleton.tsx`, `spinner.tsx`, `tooltip.tsx`, `sonner.tsx`.
      - Misc: `button.tsx`, `toggle.tsx`, `toggle-group.tsx`, `avatar.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `hero.tsx`, `placeholder-pattern.tsx`, `text-animate.tsx`, `icon.tsx`, `item.tsx`.

  - **`layouts/`**
    - `auth-layout.tsx` with sublayouts: `auth/auth-card-layout.tsx`, `auth/auth-simple-layout.tsx`, `auth/auth-split-layout.tsx`.
    - `app-layout.tsx`, `app/app-header-layout.tsx`, `app/app-sidebar-layout.tsx`.
    - `settings/layout.tsx` for the settings section.

  - **`hooks/`**
    - `use-active-url.ts`: compute active navigation item based on URL.
    - `use-appearance.tsx`: theme/appearance management.
    - `use-clipboard.ts`: copy-to-clipboard helpers.
    - `use-initials.tsx`: derive initials from a name.
    - `use-is-in-view.tsx`: intersection observer / element visibility.
    - `use-mobile-navigation.ts`, `use-mobile.ts`, `use-mobile.tsx`: mobile/responsive helpers.
    - `use-two-factor-auth.ts`: 2FA-related behavior on the client.

  - **`lib/utils.ts`**
    - Shared utilities (e.g. class name helpers, misc functions).

  - **`types/`**
    - `index.d.ts`: custom/global TypeScript declarations.
    - `vite-env.d.ts`: Vite environment typings.

#### `routes/`

- **`web.php`**
  - `/` → `welcome` Inertia page with `canRegister` flag (`home` route).
  - `/landlorddashboard` → `landlordDashboard`.
  - `/testdashboard` → `testDashboard`.
  - `/mail` → `mail`.
  - `/tenant/{id}` → `tenantDashboard`:
    - Loads `Tenant::findOrFail($id)` and passes it as `tenant` prop.
  - Authenticated & verified group:
    - `/dashboard` → `dashboard`:
      - Loads all tenants ordered by name and passes as `tenants`.
  - Includes `settings.php`.

- **`settings.php`**
  - Authenticated group:
    - Redirect `/settings` → `/settings/profile`.
    - `GET /settings/profile` → `ProfileController@edit` (`profile.edit`).
    - `PATCH /settings/profile` → `ProfileController@update` (`profile.update`).
  - Authenticated & verified:
    - `DELETE /settings/profile` → `ProfileController@destroy` (`profile.destroy`).
    - `GET /settings/password` → `PasswordController@edit` (`user-password.edit`).
    - `PUT /settings/password` → `PasswordController@update` (`user-password.update`) with throttling.
    - `GET /settings/appearance` → Inertia `settings/appearance` (`appearance.edit`).
    - `GET /settings/two-factor` → `TwoFactorAuthenticationController@show` (`two-factor.show`).

- **`console.php`**
  - Console/Artisan routes (currently default unless extended).

#### `public/`

- `index.php`: front controller for all web requests.
- Assets: `favicon.*`, `logo.svg`, `apple-touch-icon.png`, `robots.txt`, `.htaccess`.

#### `storage/`

- Standard Laravel storage structure: `app/`, `framework/`, `logs/`.
- `storage/app/receipts/` (or cloud disk equivalent): stores generated PDF receipt files keyed `{payment_id}-{date}.pdf`. Disk is configurable via `FILESYSTEM_DISK`.

#### `tests/`

- **`Feature/Auth`**
  - Tests for authentication, email verification, password confirmation, password reset, registration, 2FA challenge, and verification notifications.
- **`Feature/DashboardTest.php`**
  - Tests dashboard behavior.
- **`Feature/Settings`**
  - Tests for password update, profile update, and two-factor authentication.
- **`Unit/ExampleTest.php`**
  - Sample unit test.
- **`Pest.php`, `TestCase.php`**
  - Pest bootstrap and base test case.

---

### 5. Current Functional State

- **Authentication & user management**
  - Fortify-based auth: registration, **username-based login** (primary for mobile), password reset, email verification, 2FA.
  - Token-based API authentication for mobile (`/api/v1/auth/*`).
  - Profile editing, password change, session management endpoints.

- **Property & Unit Management**
  - Landlords manage properties and units via the mobile app API.
  - Units have a state machine: `available → occupied → available`.

- **Tenant Onboarding**
  - Atomic creation of `Tenant` + `User` + optional `Tenancy` via `TenantService`.
  - Auto-generated `username` in format `firstname.lastname{n}` for landlord-created tenants.
  - Add Tenant mobile form uses full-width vertical layout with real-time available-unit filtering.

- **Payment Architecture** *(refactored Q2 2026 — Phases 3 & 4)*
  - **Single source of truth**: all payment processing flows through `PaymentService`.
  - **Pluggable gateway drivers**: `ManualGateway` (synchronous) and `MpesaGateway` (async STK push) implement `PaymentGatewayInterface`. Active driver is configured via `PAYMENTS_DEFAULT_GATEWAY`.
  - **Idempotency**: 30-second deduplication window on `tenancy_id + amount + payment_type` prevents double-payments.
  - **Event-driven async side-effects**: `PaymentConfirmed` event dispatched by `MpesaWebhookController`; `ProcessPaymentConfirmed` queued listener handles: rent/utility bill synchronisation (status derived from bill, not hardcoded), receipt PDF generation, and multi-channel notification dispatch.
  - **Receipt generation**: `ReceiptService` generates PDF receipts via `barryvdh/laravel-dompdf`, stored via the `Storage` facade (disk-agnostic: `local`/`s3` via `FILESYSTEM_DISK`). On-the-fly generation if receipt not yet stored.
  - Tenant and Landlord retrieve signed receipt URLs via `GET /api/v1/{role}/payments/{id}/receipt`.

- **Rent & Utility Billing**
  - Monthly rent bills auto-generated on the 1st of each month (`rent-bills:generate-monthly`).
  - Daily overdue marking for rent bills and utility bills.
  - Landlords can waive bills. Payment sync updates `amount_paid` and `status` atomically; `syncPaymentWithRentBill` guards against double-crediting.

- **Notifications** *(refactored Q2 2026 — Phase 2)*
  - `NotificationService` dispatches `PaymentReceived`, `RentBillGenerated`, `RentBillOverdue`.
  - All notification classes implement `ShouldQueue` — non-blocking delivery.
  - Multi-channel: `database`, `WhatsAppChannel` (Twilio), `ExpoPushChannel`.

- **API Layer**
  - 73 registered routes under `/api/v1/` (verified via `route:list`).
  - Responses standardised via `PaymentResource`, `RentBillResource` API resources.
  - Webhook endpoint: `POST /webhooks/mpesa/callback` (no auth, CSRF-exempt).

- **Mobile App** *(React Native/Expo)*
  - Role-based screens: full landlord and tenant feature sets.
  - TypeScript API clients (`tenant.ts`, `landlord.ts`) with `getPaymentReceipt()` and `createPayment()` fully typed.
  - `Payment` TypeScript interface includes all new gateway, receipt, and bill fields.
  - Premium animated splash screen with zero-flicker background loading.

- **Settings & Web**
  - `/settings/profile`, `/settings/password`, `/settings/appearance`, `/settings/two-factor` via Inertia pages.
  - Modern glassmorphism UI (Tailwind 4 + shadcn/ui, dark/light theming).

- **Quality & tooling**
  - Laravel Pint for PHP; ESLint + Prettier for JS/TS.
  - Pest tests with coverage for auth, dashboard, and settings.
  - Post-refactoring verified: `php artisan event:list`, `route:list`, `config:show payments`.
