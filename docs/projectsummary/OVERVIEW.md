## Estate Practice – Technical Overview

> Last updated: 2026-05-20

> **What exists now.** For product vision, goals, and roadmap, see [`docs/vision/`](../vision/vision.md).

### 1. Summary

**Estate Practice** is a Laravel + Inertia + React/TypeScript application for property/tenant management, with role‑oriented dashboards (admin, landlord, tenant), and a modern glassmorphism UI.
It uses Laravel 12 on the backend with Fortify for session-based web auth and Sanctum for token-based API auth, with Inertia for the SPA layer, and a Vite + Tailwind + React 19 front‑end.

The system enforces a type-safe `App\Enums\Role` PHP 8.1 backed enum as the canonical source of truth for all role comparisons. All authorization boundaries (Policies, FormRequests, Controllers, Redirects) are built against this enum — string literals for roles do not exist anywhere in the active codebase.

---

### 2. Tech Stack 

- **Backend**
  - **Language**: PHP ^8.5
  - **Framework**: Laravel ^12.0 (`laravel/framework`) — currently 12.59.0
  - **SPA adapter**: `inertiajs/inertia-laravel` ^2.0
  - **Authentication & security**:
    - `laravel/fortify` ^1.37 for web auth flows (registration, login, password reset, 2FA)
    - `laravel/sanctum` ^4.3 for mobile API authentication (permanent tokens)
    - `App\Enums\Role` — type-safe PHP 8.1 backed enum for all role authorization
  - **Notification channels** *(Phase 2 — ported)*:
    - `WhatsAppChannel` via `twilio/sdk` for WhatsApp delivery
    - `ExpoPushChannel` for Expo mobile push notifications
  - **Real-time** *(WebSockets)*:
    - `laravel/reverb` for WebSocket server
    - `laravel-echo` for client-side event listening
  - **PDF Generation** *(Phase 4 — ported)*:
    - `barryvdh/laravel-dompdf` for receipt generation
  - **Document Storage** *(Phase 6 — complete)*:
    - Polymorphic document attachment system (tenancies, payments, properties)
    - UUID-based file paths, MIME validation, role-based access control, soft deletes
  - **Routing & URLs**:
    - `laravel/wayfinder` ^0.1.20
    - `tightenco/ziggy` ^2.6.2 (mirrored on the frontend with `ziggy-js`)
  - **Dev & tooling**:
    - `laravel/tinker` (REPL)
    - `laravel/pail` (log viewer)
    - `laravel/sail` (optional Docker dev env)
    - `laravel/pint` (PHP linter/formatter)
    - `pestphp/pest` ^4.7 + `pestphp/pest-plugin-laravel` (testing — 483 tests passing)

- **Frontend**
  - **Language & runtime**:
    - TypeScript ^5.7.2
    - React ^19.2.3 (`react`, `react-dom`)
  - **Bundler/dev server**:
    - Vite ^7.0.4 with `@vitejs/plugin-react`
    - `laravel-vite-plugin` and `@laravel/vite-plugin-wayfinder` for Laravel integration
  - **SPA framework**:
    - `@inertiajs/react` ^2.3.10
  - **Styling & UI**:
    - Tailwind CSS ^4.1.18 with `@tailwindcss/vite`
    - Glassmorphism component libraries: `@yhooi2/shadcn-glass-ui`
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
    - ESLint 9.39 (`eslint`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import`, `eslint-import-resolver-typescript`)
    - Prettier 3.8 with `prettier-plugin-tailwindcss` and `prettier-plugin-organize-imports`
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
  - `PasswordValidationRules.php`, `ProfileValidationRules.php`: reusable validation traits for user/password/profile operations.

- **`Http/Controllers`**
  - `Controller.php`: base controller.
  - `Settings/PasswordController.php`: password change UI/logic.
  - `Settings/ProfileController.php`: profile edit/update/delete.
  - `Settings/TwoFactorAuthenticationController.php`: 2FA management endpoints.

- **`Http/Middleware`**
  - `HandleAppearance.php`: handles user appearance/theme preferences.
  - `HandleInertiaRequests.php`: standard Inertia middleware (shared props, asset versioning).

- **`Http/Requests/Settings`**
  - `PasswordUpdateRequest.php`, `ProfileDeleteRequest.php`, `ProfileUpdateRequest.php`, `TwoFactorAuthenticationRequest.php`: form request validators for settings routes.

- **`Models`**
  - `User.php`: main auth user model (Fortify and Sanctum enabled).
  - `Tenant.php`: domain model for tenants.
  - `UtilityType.php`: utility category catalog (water, electricity, security, etc.).
  - `TenancyUtility.php`: links tenancies to utility types with billing amounts.
  - `UtilityBill.php`: monthly charge records for utilities.
  - `Payment.php`: tracks all payments including utility payments.
  - `Document.php`: polymorphic document attachment model with soft deletes.

- **`Services`**
  - `UtilityService.php`: service for managing utility connections (legacy system).
  - `DocumentService.php`: service for document upload, download, listing, and deletion with validation and authorization.

- **`Rules`**
  - `UtilityBillBelongsToTenancy.php`: validation rule ensuring utility bills belong to the correct tenancy.

- **`Providers`**
  - `AppServiceProvider.php`: app bootstrapping and bindings.
  - `FortifyServiceProvider.php`: Fortify configuration (features, views, actions).

- **`dashboard/data.json`**
  - Seed/fixture data for dashboard UI (cards, charts, etc.).

#### `config/`

- Standard Laravel config: `app.php`, `auth.php`, `cache.php`, `database.php`, `filesystems.php`, `fortify.php`, `inertia.php`, `logging.php`, `mail.php`, `queue.php`, `services.php`, `session.php`.
- Key configs:
  - **`fortify.php`**: authentication features (registration, 2FA, etc.).
  - **`inertia.php`**: Inertia integration (SSR, root view).
  - **`auth.php`**: guards, providers, password brokers.

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
  - `2026_05_16_000001_create_documents_table.php`: polymorphic document storage with soft deletes.
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

- **`web.php`**: All web routes. Dashboard redirect enforced via `Role` enum (admin → `/admin/dashboard`, landlord → `/landlord/dashboard`, tenant → `/tenant/dashboard`). Debug routes (`/tests`, `/tests2`, `/mail`) have been **removed**.
- **`api.php`**: Exclusively under `/api/v1/` prefix — **81 active routes**. Unversioned `/api/*` routes removed (strict versioning enforced). Groups: auth, admin (notifications), landlord (dashboard, properties, units, tenants, payments, rent-bills, utility-bills, tenancy-utilities, notifications, profile, documents), tenant (dashboard, payments, rent-bills, utilities, notifications, profile, documents), users.
- **`settings.php`**: Profile, password, appearance, 2FA settings routes.
- **`console.php`**: Artisan console routes.

#### `public/`

- `index.php`: front controller for all web requests.
- Assets: `favicon.*`, `logo.svg`, `apple-touch-icon.png`, `robots.txt`, `.htaccess`.

#### `storage/`

- Standard Laravel storage structure: `app/`, `framework/`, `logs/` with `.gitignore` placeholders.

#### `tests/`

- **`Feature/Admin`**: Admin portal access and actions
- **`Feature/Api`**: Complete Mobile API tests (Landlord & Tenant endpoints, Data Isolation) — all target `/api/v1/` prefix
- **`Feature/Auth`**: Authentication, verification, login flows
- **`Feature/Landlord`**: Web Application controllers for Landlords
- **`Feature/Models`**: Unit tests for eloquent model behaviors
- **`Feature/Services`**: Comprehensive tests for isolated business logic
- **`Feature/Tenant`**: Web Application controllers for Tenants
- **`ArchTest.php`**: Architecture rules mapping rigid structures
- **`Pest.php`, `TestCase.php`**: Pest bootstrap and base test case
- **483 tests, 1428 assertions — 100% passing**

---

### 5. Current Functional State

- **Authentication & user management**
  - Fortify-based web auth: registration, username-based login (for mobile), password reset, email verification, 2FA.
  - Sanctum-based API auth for mobile clients (permanent tokens per device).
  - Role-based post-login redirect via `Role` enum in `LoginResponse` and `/dashboard` route guard.
  - Profile editing and deletion; password update with throttling.

- **Type-Safe Role Authorization (Enum Architecture)**
  - `App\Enums\Role` is the **single source of truth** for all role-based logic.
  - `User.role` column cast to `App\Enums\Role` in the User model.
  - All Policies use `before()` admin bypass via enum check.
  - All FormRequests use `Role::Landlord`, `Role::Tenant`, `Role::Admin` — no string literals.
  - Property deletion restricted to Admin only.

- **Communication & Notification Layer (Phase 2 — ported)**
  - `WhatsAppChannel`: delivers notifications via Twilio to tenant/landlord WhatsApp.
  - `ExpoPushChannel`: delivers push notifications to mobile Expo clients.
  - `PaymentReceived`, `RentBillGenerated`, `RentBillOverdue` implement `ShouldQueue` and deliver via all three channels.

- **PDF Receipt Generation (Phase 4 — ported)**
  - PDF receipt generation for all confirmed payments via `ReceiptService` and DomPDF.
  - Endpoints: `GET /api/v1/landlord/payments/{id}/receipt` and `GET /api/v1/tenant/payments/{id}/receipt`.

- **Document Storage System (Phase 6 — complete)**
  - Polymorphic document attachment to tenancies, payments, and properties via `documentable` morph relationship.
  - `DocumentService` handles upload (with MIME + size validation), download (streamed), listing, and soft-delete.
  - `DocumentPolicy` enforces role-based access: landlords own property documents, tenants view their tenancy documents, admins bypass all.
  - Web UI: landlord tenant show page has upload/list/delete; tenant has dedicated `/tenant/documents` page and dashboard section.
  - Mobile: dedicated Documents screens for both tenant (read-only + download) and landlord (full CRUD with `expo-document-picker`).
  - Artisan command `php artisan documents:backfill` migrates legacy `tenancy_agreement_path` records.
- **Property, Unit, Tenant & Tenancy Management**
  - Full CRUD for properties and units (admin/landlord, policy-enforced).
  - Tenant creation with auto-generated credentials; self-registration on mobile.
  - Unit status auto-updates on tenancy start/end.
  - Tenancy state machine: pending → active → expired/ended.

- **Payment & Billing**
  - Landlord records and manages payments. Tenant makes payments via mobile.
  - Payments link to `RentBill` or `UtilityBill` records.
  - Monthly rent/utility bill generation via scheduled commands.
  - Bills auto-marked overdue daily.

- **API**
  - All mobile API endpoints exclusively at `/api/v1/` — **81 active routes**.
  - All responses use `{ data: ..., meta: ... }` wrapping via Eloquent Resources.
  - Mobile `EXPO_PUBLIC_API_URL` configured to `http://{wifi-ip}:8000/api/v1`.

- **Settings area**
  - `/settings/profile`, `/settings/password`, `/settings/appearance`, `/settings/two-factor`.

- **UI/UX**
  - Modern glassmorphism UI built on Tailwind + shadcn-inspired components.
  - App shell with sidebar/header/navigation, responsive behavior, dark/light theming.

- **Mobile App (React Native/Expo)**
  - Cross-platform iOS and Android. Role-based screens.
  - Premium splash screen with background loading (zero-flicker transition).
  - Rent Billing: view/pay rent bills, link payments to bills, waive bills.
  - Sanctum authentication with permanent tokens.

- **Quality & tooling**
  - Pest 4: **483 tests, 1428 assertions — 100% passing**.
  - All API tests target `/api/v1/` prefix.
  - `npm run build` verified clean.

- **Service Pattern**
  - `TenantService`, `UnitService`, `OnboardingService`, `DashboardServices`, `PaymentService`, `RentBillService`, `UtilityService`, `NotificationService`, `ReceiptService`, `DocumentService`.

---

### 6. Active Branch & Porting Status

All active development on branch `port/payment-architecture`.

| Phase | Description | Status | Commit |
|-------|-------------|--------|--------|
| Phase 1 | Role Enum, Policies, API Resources, RentBillService fix | ✅ Complete | `0ac0412` |
| Phase 2 | WhatsApp/Expo Channels, ShouldQueue Notifications | ✅ Complete | `84615d2` |
| Stabilization | Enum auth migration, dead code removal, strict API versioning | ✅ Complete | `c858dc6` |
| Phase 3 | Payment Gateway, M-Pesa Webhook, Events, DB Migration | ✅ Complete | — |
| Phase 4 | ReceiptService, DomPDF, Receipt Endpoints | ✅ Complete | — |
| Phase 5 | Event Wiring, Status Derivation, Mobile Type Updates | ✅ Complete | — |
| Phase 6 | Document Storage System (DB, Models, Services, Controllers, Policies, Web UI, Mobile, Tests) | ✅ Complete | `c76b70e` |
