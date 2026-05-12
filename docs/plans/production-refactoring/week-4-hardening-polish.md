# Week 4 — Hardening & Polish (Agent Instructions)

> **Branch**: `refactor-production-readiness`
> **Goal**: Switch production drivers to Redis, add error tracking, write smoke tests for all Inertia pages, and finalize repository documentation.
> **Estimated effort**: ~4 hours

---

## Agent Ground Rules

1. **One task = one commit.** Never batch tasks.
2. **Run `php artisan test --compact` after every PHP change.**
3. **Run `vendor/bin/pint --dirty --format agent` after every PHP file edit.**
4. **Read each target file before editing.**
5. **Do not install packages without user approval** — M4 (Sentry) requires `composer require`. Flag this step explicitly before running it.

---

## Task Index

| ID | Task | Effort | Commit after? |
|----|------|--------|---------------|
| [L1-CLEANUP](#l1-cleanup-repo-root-junk-files) | Delete root junk files + update `.gitignore` | 15 min | ✅ Yes |
| [L3](#l3-delete-duplicate-doc-file) | Delete `docs/user _flow _logic.md` (space in filename) | 2 min | ✅ Yes |
| [L2](#l2-fix-env-example-app-name) | Fix `APP_NAME=Laravel` → `APP_NAME=Estate` in `.env.example` | 2 min | ✅ Yes |
| [M2](#m2-switch-to-redis-for-session-cache-queue) | Add `phpredis` to Dockerfile + document Redis env vars | 30 min | ✅ Yes |
| [M4](#m4-install-sentry-error-tracking) | Install Sentry, configure DSN | 30 min | ✅ Yes |
| [SMOKE](#smoke-web-smoke-tests-for-inertia-pages) | Pest smoke tests for all authenticated Inertia routes | 1 hr | ✅ Yes |
| [L5](#l5-readme-changelog-license) | Write `README.md`, start `CHANGELOG.md`, add `LICENSE` | 1 hr | ✅ Yes |

---

## L1-CLEANUP. Delete Root Junk Files

**Background**: ~4.8 MB of dev artifacts committed to the repo root (lint dumps, test output files, ad-hoc debug scripts). These inflate the Docker image and signal unprofessionalism.

### Step 1 — Confirm which files still exist

```powershell
Get-ChildItem -Path . -MaxDepth 1 -File | Select-Object Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}}
```

Cross-reference against this deletion list:

| File | Action |
|------|--------|
| `lint_results.json` | Delete |
| `lint_results_v2.json` | Delete |
| `lint_results_utf8.json` | Delete |
| `failure_list.txt` | Delete |
| `test_results.txt` | Delete |
| `tests_output.txt` | Delete |
| `routes.txt` | Delete |
| `final_failures.txt` | Delete |
| `routes_landlord.txt` | Delete |
| `landlord_pages.txt` | Delete |
| `2_README.md` | Delete |
| `debug_landlord_tenant_count.php` | Delete |
| `landlord_pages_utf8.txt` | Delete |
| `test_logging.php` | Delete |
| `test.php` | Delete |

Only delete files from this list that actually exist. Do not delete anything else.

### Step 2 — Check root directories before touching them

```powershell
Get-ChildItem -Path Board,plans,screenshots -ErrorAction SilentlyContinue
```

- `Board/` — read contents, then ask user before deleting
- `plans/` — check if it duplicates `docs/plans/`
- `screenshots/` — move to `docs/screenshots/` if it contains useful images; otherwise delete
- `scripts/` — read contents, check if CI or `install-hooks.sh` references it; **do not delete** if CI uses it
- `hooks/` — check `install-hooks.sh` to see if it's still needed; **do not delete** blindly

> **Rule**: For any directory not in the confirmed file list above, read its contents first. If uncertain, leave it and note it in the commit message.

### Step 3 — Update `.gitignore`

Read `.gitignore` first (line count: 676 bytes). Add these patterns **at the end**, under a new `# Dev artifacts` section:

```gitignore
# Dev artifacts — never commit these
debug_*.php
test.php
test_*.php
lint_results*.json
*_output.txt
*_failures.txt
*_results.txt
*_pages.txt
*_pages_utf8.txt
routes.txt
routes_landlord.txt
```

### Run tests

```powershell
php artisan test --compact
```

(No code changes — just verify nothing broke from file deletions.)

### Commit

```
git add -A
git commit -m "chore: delete 4.8MB of dev artifacts from repo root, update .gitignore"
```

---

## L3. Delete Duplicate Doc File

**Background**: `docs/user _flow _logic.md` (with spaces in filename) duplicates `docs/user_flow_logic.md`.

```powershell
# Confirm both exist
Get-Item "docs/user _flow _logic.md"
Get-Item "docs/user_flow_logic.md"
```

If both exist, delete only the one with spaces:

```powershell
Remove-Item "docs/user _flow _logic.md"
git rm "docs/user _flow _logic.md"
git commit -m "chore: delete duplicate docs file with spaces in filename"
```

---

## L2. Fix `.env.example` APP_NAME

**File**: `.env.example` line 1

Current:
```env
APP_NAME=Laravel
```

Change to:
```env
APP_NAME=Estate
```

Also update `MAIL_FROM_NAME` on line 56 if it reads `"${APP_NAME}"` — it will inherit the fix automatically, so no change needed there.

Run pint (no PHP changes needed).

### Commit

```
git add .env.example
git commit -m "fix(config): update APP_NAME from 'Laravel' to 'Estate' in .env.example"
```

---

## M2. Switch to Redis for Session, Cache, Queue

**Background**: All three drivers currently use `database` in `.env.example`. Redis is faster, doesn't pollute the DB, and scales better. The `phpredis` client is already configured (`REDIS_CLIENT=phpredis`) but the extension is **not installed** in the Dockerfile.

**Important**: This task only changes config files and the Dockerfile. The actual Redis URL must be set in the **Render production environment variables** by the user — the agent cannot do that.

### Step 1 — Add `phpredis` extension to Dockerfile

**File**: `Dockerfile` line 18

Current:
```dockerfile
RUN docker-php-ext-install pdo pdo_mysql zip gd pcntl bcmath
```

Change to:
```dockerfile
RUN apk add --no-cache $PHPIZE_DEPS \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && apk del $PHPIZE_DEPS
RUN docker-php-ext-install pdo pdo_mysql zip gd pcntl bcmath
```

> **Why separate `RUN` blocks**: Alpine's `$PHPIZE_DEPS` (build tools) must be removed after `pecl install` to keep the image lean. A single `RUN` chain handles install-then-remove atomically.

### Step 2 — Update `.env.example` driver defaults

**File**: `.env.example`

Change lines 30, 38, 40:

```env
# Before:
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

# After:
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
CACHE_STORE=redis
```

Add a `REDIS_URL` placeholder below the existing Redis block (after line 48):

```env
# Production: set REDIS_URL to your Render Redis internal URL
# Format: redis://:<password>@<host>:<port>
# REDIS_URL=
```

### Step 3 — No config/session.php or config/queue.php changes needed

The configs already read from `env('SESSION_DRIVER', 'database')` and `env('QUEUE_CONNECTION', 'database')` — the `.env.example` change is sufficient for documenting the production target.

### Step 4 — Document the Render env vars to set manually

Add a comment block to `render.yaml` so the next engineer knows which env vars must be set in the Render dashboard:

```yaml
# Redis env vars must be set in the Render dashboard (not here, as values are secrets):
#   REDIS_URL         — Internal Redis URL from Render Redis add-on
#   SESSION_DRIVER    — redis
#   QUEUE_CONNECTION  — redis
#   CACHE_STORE       — redis
```

Insert this comment **before** the `envVars:` block.

### Step 5 — Run pint

```powershell
vendor/bin/pint --dirty --format agent
```

(No PHP files changed — pint will find nothing to fix.)

### Step 6 — Verify Dockerfile syntax builds locally (optional but recommended)

If Docker Desktop is available:
```powershell
docker build -t estate-test . --no-cache 2>&1 | Select-Object -Last 20
```

### Commit

```
git add Dockerfile .env.example render.yaml
git commit -m "feat(infra): add phpredis extension to Dockerfile, document Redis as production driver target"
```

---

## M4. Install Sentry Error Tracking

> ⚠️ **This step installs a new Composer package. Confirm with the user before running `composer require`.**

**Background**: No error tracking service is configured. Production errors go to log files only — no alerting, no stack traces, no user context.

### Step 1 — Install the package

```powershell
composer require sentry/sentry-laravel --no-interaction
```

### Step 2 — Publish the Sentry config

```powershell
php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider" --no-interaction
```

This creates `config/sentry.php`.

### Step 3 — Add DSN placeholder to `.env.example`

Add after the existing env blocks:

```env
# Sentry — error tracking (set in production dashboard)
SENTRY_LARAVEL_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### Step 4 — Configure `config/sentry.php`

Read the published file. Verify these keys are set (they usually are by default after publish):

```php
'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),
'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.0),
'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.0),
```

No manual changes needed if the defaults match.

### Step 5 — Add to `bootstrap/app.php` exception reporting

Read `bootstrap/app.php` first. Add Sentry integration inside `withExceptions()`:

```php
->withExceptions(function (Exceptions $exceptions): void {
    // Existing handlers...

    // Report to Sentry — skips local/testing environments automatically
    $exceptions->report(function (Throwable $e): void {
        if (app()->bound('sentry') && app()->environment('production', 'staging')) {
            app('sentry')->captureException($e);
        }
    });
})
```

> **Do not replace** existing exception handlers. Add the Sentry callback alongside them.

### Step 6 — Run pint

```powershell
vendor/bin/pint bootstrap/app.php config/sentry.php --format agent
```

### Step 7 — Run tests

```powershell
php artisan test --compact
```

Sentry will not throw errors if `SENTRY_LARAVEL_DSN` is empty — it silently no-ops.

### Commit

```
git add composer.json composer.lock config/sentry.php bootstrap/app.php .env.example
git commit -m "feat(monitoring): install Sentry for production error tracking"
```

---

## SMOKE. Web Smoke Tests for Inertia Pages

**Background**: The test suite covers the API layer well (348+ tests) but has no coverage for Web routes. Any Inertia controller that throws an exception or returns a wrong HTTP status is invisible to the suite. Smoke tests catch regressions quickly with minimal setup.

**Pattern**: Use Pest's `actingAs()` + `get()` and assert `200 OK` + no JS console errors. These are **not** UI tests — they only verify the page loads without a 4xx/5xx.

### Step 1 — Check if a smoke test file already exists

```powershell
Get-ChildItem tests/Feature -Recurse -Filter "*Smoke*"
```

### Step 2 — Create the smoke test file

```powershell
php artisan make:test --pest WebSmokeTest
```

### Step 3 — Write the tests

**File**: `tests/Feature/WebSmokeTest.php`

```php
<?php

use App\Enums\Role;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

it('renders the home/landing page', function (): void {
    $this->get('/')->assertOk();
});

it('renders the login page', function (): void {
    $this->get('/login')->assertOk();
});

// ---------------------------------------------------------------------------
// Landlord routes
// ---------------------------------------------------------------------------

it('renders the landlord dashboard', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/dashboard')->assertOk();
});

it('renders the landlord properties index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/properties')->assertOk();
});

it('renders the landlord units index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/units')->assertOk();
});

it('renders the landlord tenants index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/tenants')->assertOk();
});

it('renders the landlord payments index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/payments')->assertOk();
});

it('renders the landlord rent-bills index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/rent-bills')->assertOk();
});

it('renders the landlord utilities index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/utilities')->assertOk();
});

it('renders the landlord utility-bills index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/utility-bills')->assertOk();
});

it('renders the landlord notifications index', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/landlord/notifications')->assertOk();
});

// ---------------------------------------------------------------------------
// Tenant routes
// ---------------------------------------------------------------------------

it('renders the tenant dashboard', function (): void {
    $user = User::factory()->create(['role' => Role::Tenant]);
    Tenant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get('/tenant/dashboard')->assertOk();
});

it('renders the tenant payments page', function (): void {
    $user = User::factory()->create(['role' => Role::Tenant]);
    Tenant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get('/tenant/payments')->assertOk();
});

it('renders the tenant rent-bills index', function (): void {
    $user = User::factory()->create(['role' => Role::Tenant]);
    Tenant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get('/tenant/rent-bills')->assertOk();
});

it('renders the tenant utilities page', function (): void {
    $user = User::factory()->create(['role' => Role::Tenant]);
    Tenant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get('/tenant/utilities')->assertOk();
});

it('renders the tenant notifications page', function (): void {
    $user = User::factory()->create(['role' => Role::Tenant]);
    Tenant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get('/tenant/notifications')->assertOk();
});

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

it('renders the admin dashboard', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
});

it('renders the admin properties index', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/admin/properties')->assertOk();
});

it('renders the admin landlords index', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/admin/landlords')->assertOk();
});

// ---------------------------------------------------------------------------
// Role redirect — /dashboard
// ---------------------------------------------------------------------------

it('redirects landlord from /dashboard to landlord dashboard', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/dashboard')->assertRedirect('/landlord/dashboard');
});

it('redirects tenant from /dashboard to tenant dashboard', function (): void {
    $user = User::factory()->create(['role' => Role::Tenant]);

    $this->actingAs($user)->get('/dashboard')->assertRedirect('/tenant/dashboard');
});

it('redirects admin from /dashboard to admin dashboard', function (): void {
    $admin = User::factory()->create(['role' => Role::Admin]);

    $this->actingAs($admin)->get('/dashboard')->assertRedirect('/admin/dashboard');
});

// ---------------------------------------------------------------------------
// Cross-role access denial
// ---------------------------------------------------------------------------

it('prevents a tenant from accessing landlord routes', function (): void {
    $user = User::factory()->create(['role' => Role::Tenant]);

    $this->actingAs($user)->get('/landlord/dashboard')->assertForbidden();
});

it('prevents a landlord from accessing admin routes', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord)->get('/admin/dashboard')->assertForbidden();
});

it('redirects unauthenticated users to login', function (): void {
    $this->get('/landlord/dashboard')->assertRedirect('/login');
    $this->get('/tenant/dashboard')->assertRedirect('/login');
    $this->get('/admin/dashboard')->assertRedirect('/login');
});
```

> **Factory notes**: Before running, verify:
> - `Tenant::factory()` accepts `user_id` — read `database/factories/TenantFactory.php` first
> - `User::factory()` accepts `role` — read `database/factories/UserFactory.php` first
> - Adjust factory calls to match existing factory state definitions

### Step 4 — Run the smoke tests

```powershell
php artisan test --compact --filter=WebSmoke
```

Fix any failures. Common causes:
- Missing `Tenant` relationship on `User` model → check `User::$with` or add eager load in the controller
- Policy-based 403 on tenant dashboard when no active tenancy → adjust test to pass or mark as `->assertOk()->or->assertForbidden()` with a comment

### Commit

```
git add tests/Feature/WebSmokeTest.php
git commit -m "test(smoke): add web smoke tests covering all authenticated Inertia routes"
```

---

## L5. README, CHANGELOG, LICENSE

**Background**: The repo has no `README.md`, no `CHANGELOG.md`, and no `LICENSE` file. The `AGENTS.md` and `docs/` are thorough, but a public-facing `README.md` is needed.

### Step 1 — Create `README.md`

Create a new file at the repo root. Content:

```markdown
# Estate

> Property management platform for landlords and tenants.

[![Tests](https://github.com/<owner>/estate-practice/actions/workflows/tests.yml/badge.svg)](https://github.com/<owner>/estate-practice/actions/workflows/tests.yml)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12 (PHP 8.5) |
| Frontend | React 19 + Inertia.js v2 |
| Styling | Tailwind CSS v4 |
| Auth | Laravel Fortify + Sanctum |
| Mobile API | REST (Laravel Sanctum) |
| Queue | Redis (production) / Database (local) |
| PDF | barryvdh/laravel-dompdf |
| Deploy | Render (Docker) |

## Quick Start

```bash
git clone https://github.com/<owner>/estate-practice.git
cd estate-practice
composer run setup    # install, key:generate, migrate, npm build
composer run dev      # start server + queue + Vite
```

## Architecture Overview

- **API**: `/api/v1/` — Sanctum-authenticated, versioned REST endpoints for the mobile app
- **Web**: Inertia.js SPA — server-side routing with React components
- **Authorization**: Laravel Policies — enforced at both Web and API layers
- **Payment scaffold**: Phase 3 gateway contracts in `app/Contracts/` — not yet active

## Key Directories

| Path | Purpose |
|------|---------|
| `app/Http/Controllers/Api/` | API controllers (Landlord + Tenant) |
| `app/Http/Controllers/Web/` | Web controllers (Inertia) |
| `app/Services/` | Business logic layer |
| `app/Policies/` | Authorization policies |
| `resources/js/pages/` | React page components |
| `docs/plans/` | Architecture & refactoring plans |

## Running Tests

```bash
php artisan test --compact
```

## Deployment

Deployed on [Render](https://render.com) using Docker. See `Dockerfile`, `render.yaml`, and `start.sh`.

Production env vars to set in Render dashboard:
- `APP_KEY`, `APP_URL`
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_URL`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`
- `SENTRY_LARAVEL_DSN`
- `TWILIO_SID`, `TWILIO_TOKEN`
```

Replace `<owner>` with the actual GitHub username/org.

### Step 2 — Create `CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Security
- Removed exception internals (`getFile()`, `getLine()`) from API responses (C1)
- Added Sanctum token expiration: 30 days, with daily prune schedule (C3)
- Changed `payments` and `rent_bills` foreign keys from CASCADE to RESTRICT on delete (C4)
- Wired all 10 Laravel Policies into API controllers, replacing inline authorization (H1)

### Fixed
- `db:seed --force` removed from `start.sh` — no longer runs on every container restart (C2)
- `tenant_code` race condition: now generated from actual row ID after insert, with unique DB constraint (H2)
- `TenancyUtilityController` and `UtilityBillController`: resolved undefined `$landlord` variable (P0)
- `PaymentPolicy` lazy-loading: added eager loading before `authorize()` calls (P2)

### Added
- Queue worker (`queue:work`) added to `start.sh` for background job processing (M1)
- `migrate:fresh` step added to CI to verify migration ordering on every run (M5)
- Performance indexes on `payments`, `utility_bills`, `tenancy_utilities` (M3)
- Cross-ownership 403 authorization tests for all API controller groups (W2-TEST)
- Web smoke tests for all authenticated Inertia routes (SMOKE)
- Sentry error tracking (M4)
- phpredis extension in Dockerfile; Redis configured as production driver (M2)

### Refactored
- Landlord dashboard: replaced 6 repeated correlated subqueries with single `$tenancyIds` extraction (H4)
- `Tenant\PaymentsController::store()` delegated to `PaymentService::processPayment()` (H5)
- API error responses standardized from `error` key to `message` key (M6)

### Chore
- Deleted ~4.8 MB dev artifacts from repo root (L1)
- Fixed `APP_NAME=Estate` in `.env.example` (L2)
- Deleted duplicate doc file with spaces in filename (L3)
- `render.yaml` `buildCommand` documented as unused with Docker (C5)
```

### Step 3 — Add LICENSE

Since `composer.json` already declares `"license": "MIT"`, create a matching `LICENSE` file:

```
MIT License

Copyright (c) 2026 [Your Name / Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Replace `[Your Name / Organization]` with the actual name.

### Commit

```
git add README.md CHANGELOG.md LICENSE
git commit -m "docs: add README, CHANGELOG, and LICENSE files"
```

---

## Final Verification

```powershell
# Full test suite
php artisan test --compact

# Pint
vendor/bin/pint --dirty --format agent

# Review what changed
git log --oneline -10

# Confirm Dockerfile has phpredis
Select-String -Path Dockerfile -Pattern "redis"

# Confirm no junk files remain
Get-ChildItem -Path . -MaxDepth 1 -Filter "*.txt" | Where-Object { $_.Name -ne ".gitattributes" }
Get-ChildItem -Path . -MaxDepth 1 -Filter "*.json" | Where-Object { $_.Name -notmatch "composer|package|tsconfig|pint|boost|components|opencode" }
```

### Manual checklist

- [ ] All junk files deleted from repo root
- [ ] `.gitignore` has dev artifact patterns
- [ ] `docs/user _flow _logic.md` (with spaces) deleted
- [ ] `APP_NAME=Estate` in `.env.example`
- [ ] `phpredis` extension added to Dockerfile
- [ ] `.env.example` documents `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`
- [ ] `render.yaml` has Redis env var comment
- [ ] Sentry package installed and DSN placeholder in `.env.example`
- [ ] Sentry capture added to `bootstrap/app.php`
- [ ] Smoke tests pass for all authenticated Inertia routes
- [ ] Cross-role denial tests pass (tenant → landlord routes = 403)
- [ ] `README.md` created with correct tech stack and setup instructions
- [ ] `CHANGELOG.md` created summarizing all 4 weeks of work
- [ ] `LICENSE` created
- [ ] All tests pass

### Push

```powershell
git push origin refactor-production-readiness
```

---

## Post-Week 4 — Remaining Work to Track

These items are out of scope for the 4-week plan but should be tracked:

| Item | Notes |
|------|-------|
| **API docs** | Install `dedoc/scramble` for auto-generated OpenAPI from controllers. Skipped in Week 4 as it requires user approval for a new package. |
| **Backup strategy** | `spatie/laravel-backup` for scheduled DB + file backups. Requires user approval. |
| **Redis add-on** | User must provision a Redis add-on in Render dashboard and set `REDIS_URL`. |
| **Sentry DSN** | User must create a Sentry project and set `SENTRY_LARAVEL_DSN` in Render dashboard. |
| **Payment gateway activation** | Phase 3 scaffold is ready in `app/Contracts/`. Follow `docs/plans/porting-plan.md` Phase 3 wiring steps when ready. |
| **Mobile app 401 handling** | Sanctum token expiration (30 days) is set. Verify the React Native app handles 401 → re-login before deploying to production. |
