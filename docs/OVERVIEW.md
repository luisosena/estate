## Estate Practice – Project Overview

### 1. Summary

**Estate Practice** is a Laravel + Inertia + React/TypeScript application for property/tenant management, with role‑oriented dashboards (landlord, tenant), a mail view, and a modern glassmorphism UI.  
It uses Laravel 12 on the backend with Fortify for authentication and Inertia for the SPA layer, and a Vite + Tailwind + React 19 front‑end.

---

### 2. Tech Stack 

- **Backend**
  - **Language**: PHP ^8.2
  - **Framework**: Laravel ^12.0 (`laravel/framework`)
  - **SPA adapter**: `inertiajs/inertia-laravel` ^2.0
  - **Authentication & security**:
    - `laravel/fortify` ^1.30 for auth flows (registration, login, password reset, email verification, 2FA)
    - `Laravel\Fortify\Features` toggles features like registration
  - **Routing & URLs**:
    - `laravel/wayfinder` ^0.1.9
    - `tightenco/ziggy` ^2.6 (mirrored on the frontend with `ziggy-js`)
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
  - `User.php`: main auth user model (Fortify enabled).
  - `Tenant.php`: domain model for tenants.

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
- **`factories/UserFactory.php`**: user factory.
- **`seeders/DatabaseSeeder.php`**: database seeding entrypoint.

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

- Standard Laravel storage structure: `app/`, `framework/`, `logs/` with `.gitignore` placeholders.

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
  - Fortify-based auth including registration, login, password reset, email verification, and 2FA.
  - Profile editing and deletion, with dedicated form request validation.
  - Password update flow with throttling and validation.

- **Tenants and dashboards**
  - `Tenant` model and migration, with routes and pages for:
    - Landlord dashboard (`/landlorddashboard`).
    - Tenant dashboard (`/tenant/{id}`) with per-tenant data.
    - Main authenticated dashboard (`/dashboard`) listing all tenants.

- **Settings area**
  - `/settings/profile`, `/settings/password`, `/settings/appearance`, `/settings/two-factor` implemented via controllers + Inertia pages.
  - React layouts and components for a cohesive settings experience.

- **UI/UX**
  - Modern glassmorphism UI built on Tailwind + shadcn/glasscn-inspired components.
  - App shell with sidebar/header/navigation, responsive behavior, and dark/light theming.
  - Reusable components for tables, charts, cards, navigation, forms, and notifications.

- **Quality & tooling**
  - Linting and formatting set up for both PHP and JS/TS.
  - Testing powered by Pest with coverage for auth, dashboard, and settings behaviors.

