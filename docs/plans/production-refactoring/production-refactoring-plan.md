# Estate — Production Readiness Plan (Single Source of Truth)

> Supersedes: `project_roadmap.md` (conversation b21cf187) and standalone audit report.
> **Audited**: Every controller, model, service, migration, policy, config, CI workflow, Dockerfile, and deployment script.
> **Last updated**: 2026-05-10

---

## What's Already Solid ✅

| Area | Evidence |
|------|----------|
| API versioning | `/api/v1/` only, unversioned routes removed |
| Role enum | `App\Enums\Role` — no string literals remain |
| Service layer | Controllers delegate to `PaymentService`, `RentBillService`, `TenantService`, etc. |
| Test suite | 348+ Pest tests, 1133 assertions, architecture guardrails in `ArchTest.php` |
| Receipt system | DomPDF streaming via `ReceiptService`, `HandlesReceipts` trait |
| Payment scaffold | Gateway contracts, M-Pesa/Manual drivers, event/listener — ready to activate |
| CI | GitHub Actions: tests (PHP 8.4/8.5 matrix), lint |
| Deployment skeleton | Dockerfile (PHP 8.5-fpm-alpine + Nginx + Vite build) |
| Security events | `SecurityEvent::log()` on login, logout, password change, profile update |
| Web authorization | 49 `$this->authorize()` calls across all Web controllers |
| Landing page | Redesigned (conversation b21cf187) |

---

## 🔴 CRITICAL — Must Fix Before Deploy

### C1. Exception Internals Leaked to API Consumers

**Impact**: Information disclosure — server file paths and line numbers exposed to any authenticated user.

The Landlord `DashboardController` is the worst offender, returning `getFile()` and `getLine()`:

```php
// app/Http/Controllers/Api/Landlord/DashboardController.php:187-193
'error' => $e->getMessage(),
'file'  => $e->getFile(),    // ← server path leaked
'line'  => $e->getLine(),    // ← source line leaked
```

21 additional locations across API + Web controllers return raw `$e->getMessage()` to users via generic `\Exception` catches.

**Fix**:
1. Replace the Dashboard catch with a static message; log the real error.
2. Audit all 21 `getMessage()` sites — keep only those catching domain-specific exceptions (`InvalidArgumentException`). For generic `\Exception`, return a static user-facing message.

**Key files**: [DashboardController.php:187](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Controllers/Api/Landlord/DashboardController.php#L187), [Tenant\PaymentsController.php:310](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Controllers/Api/Tenant/PaymentsController.php#L310), [HandlesReceipts.php:32](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Controllers/Concerns/HandlesReceipts.php#L32)

---

### C2. `start.sh` Runs `db:seed --force` on Every Boot

**Impact**: Data corruption — seeders re-execute on every container restart/deploy.

```bash
# start.sh:16
php artisan db:seed --force
```

If seeders create records, duplicates accumulate. If they truncate, production data is destroyed.

**Fix**: Remove `db:seed --force`. If lookup table seeding is needed, use `--class=UtilityTypeSeeder` with upsert logic.

**File**: [start.sh:16](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/start.sh#L16)

---

### C3. API Tokens Never Expire

**Impact**: Stolen tokens are valid forever; old device tokens accumulate indefinitely.

```php
// config/sanctum.php:53
'expiration' => null,
```

**Fix**: Set `'expiration' => 60 * 24 * 30` (30 days). Add `$schedule->command('sanctum:prune-expired --hours=720')->daily()` to the scheduler. Ensure the mobile app handles 401 → re-login gracefully.

**File**: [sanctum.php:53](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/config/sanctum.php#L53)

---

### C4. Cascade-Delete Chain Wipes Financial Records

**Impact**: Deleting a tenant (even accidentally via DB) destroys all payments, rent bills, and tenancies.

Migration chain:
```
tenants → tenancies (cascadeOnDelete) → payments (cascadeOnDelete)
                                       → rent_bills (cascadeOnDelete)
payments also has tenant_id → cascadeOnDelete (double path)
```

**Fix**: New migration to change `payments` FKs to `restrictOnDelete` and `rent_bills` FK to `restrictOnDelete`. Test on staging first.

**Files**: [create_payments_table.php:16-17](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/database/migrations/2026_02_03_154927_create_payments_table.php#L16), [create_rent_bills_table.php:13-15](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/database/migrations/2026_03_21_000001_create_rent_bills_table.php#L13)

---

### C5. Dockerfile / render.yaml Conflict

**Impact**: `render.yaml`'s `buildCommand` is **ignored** when `env: docker` — the Dockerfile handles the entire build. The roadmap's original suggestion to "add npm to buildCommand" would have had no effect.

```yaml
# render.yaml — buildCommand is unused when env: docker
buildCommand: composer install --no-interaction --no-dev  # ← dead code
```

The Dockerfile correctly runs `composer install`, `npm install`, and `npm run build`. The risk is future confusion if someone edits `buildCommand` expecting it to work.

**Fix**: Remove `buildCommand` from `render.yaml` or add a comment explaining it's unused with Docker. The Dockerfile itself is correct.

**File**: [render.yaml](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/render.yaml)

---

## 🟠 HIGH — Fix Before Production Launch

### H1. Policy Usage Gaps — 1 Completely Unused, All 10 Unused in API

**Impact**: Authorization logic is inline and inconsistent across all 16 API controllers. Policies exist but are only utilized by Web controllers — and one policy (`UserPolicy`) is **completely dead code** across the entire application.

**Per-policy usage matrix:**

| Policy | Web Landlord | Web Tenant | Web Admin | API (all) | Status |
|--------|:-----------:|:----------:|:---------:|:---------:|--------|
| `PropertyPolicy` | ✅ 2 calls | — | ✅ 6 calls | ❌ 0 | Partially used |
| `PaymentPolicy` | ✅ 3 calls | ✅ 2 calls | — | ❌ 0 | Partially used |
| `TenantPolicy` | ✅ 6 calls | — | — | ❌ 0 | Partially used |
| `UnitPolicy` | ✅ 4 calls | — | — | ❌ 0 | Partially used |
| `TenancyPolicy` | ✅ 4 calls | — | — | ❌ 0 | Partially used |
| `RentBillPolicy` | ✅ 2 calls | ✅ 1 call | — | ❌ 0 | Partially used |
| `TenancyUtilityPolicy` | ✅ 4 calls | — | — | ❌ 0 | Partially used |
| `UtilityBillPolicy` | ✅ 2 calls | — | — | ❌ 0 | Partially used |
| `NotificationPolicy` | ✅ 3 calls | ✅ 3 calls | — | ❌ 0 | Partially used |
| **`UserPolicy`** | **❌ 0** | **❌ 0** | **❌ 0** | **❌ 0** | **🔴 Completely unused** |

> [!WARNING]
> `UserPolicy` has `view`, `update`, `create`, `delete` methods with an admin `before()` gate — but **no controller anywhere in the app calls `$this->authorize()` with a `User` model**. The `Api\UserController` does all authorization inline with `if ($user->role !== Role::Admin)` checks.

**Fix**:
1. Wire all 10 policies into their corresponding API controllers, replacing inline checks.
2. For `UserPolicy`: wire it into `Api\UserController` (the admin user management controller).
3. Add 403-assertion tests for each endpoint.

---

### H2. Tenant Code Race Condition

**Impact**: Concurrent tenant creation produces duplicate `tenant_code` values.

```php
// app/Models/Tenant.php:63
$lastId = Tenant::withTrashed()->max('id') + 1;
$tenant->tenant_code = 'TEN-'.str_pad($lastId, 5, '0', STR_PAD_LEFT);
```

No unique constraint exists on `tenant_code` in the database.

**Fix**: (1) Add `$table->unique('tenant_code')` migration. (2) Switch to `DB::raw("LPAD(LAST_INSERT_ID(), 5, '0')")` or generate codes after insert using the actual `$tenant->id`.

**File**: [Tenant.php:59-66](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Tenant.php#L59)

---

### H3. Password = Username on Tenant Creation

**Impact**: Landlord-created tenants have trivially guessable passwords.

```php
// app/Services/TenantService.php:82
'password' => $username, // e.g. "john.doe837"
```

No forced password-change mechanism exists.

**Fix**: Generate `Str::random(12)` as the temp password, return it in credentials response, and add a `must_change_password` flag checked on login.

**File**: [TenantService.php:82](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Services/TenantService.php#L82)

---

### H4. N+1 Queries in Landlord Dashboard

**Impact**: 7 separate queries each running the same 3-level `whereHas('tenancy.unit.property')` correlated subquery.

```php
// Repeated 7 times in DashboardController
Payment::whereHas('tenancy.unit.property', fn ($q) => $q->where('owner_id', $landlord->id))
```

**Fix**: Extract `$propertyIds = $landlord->properties()->pluck('id')` once, then use direct joins or `whereIn` on unit/tenancy IDs.

**File**: [Landlord\DashboardController.php](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Controllers/Api/Landlord/DashboardController.php)

---

### H5. Payment Logic Duplicated in 3 Places

**Impact**: Bugs must be fixed in 3 independent implementations. Subtle differences already exist (e.g., tenant controller re-implements duplicate detection differently).

1. `PaymentService::processPayment()` — original flow
2. `PaymentService::processGatewayPayment()` — scaffold flow
3. `Tenant\PaymentsController::store()` — 200+ lines of inline logic

**Fix**: Refactor `Tenant\PaymentsController::store()` to delegate to the service. Keep `processGatewayPayment()` as the scaffold path.

---

## 🟡 MEDIUM — Address Before Scaling

### M1. No Queue Worker in Production

`ProcessPaymentConfirmed` implements `ShouldQueue`, but `start.sh` only starts `php-fpm` and `nginx`. Queued jobs sit in the `jobs` table forever.

**Fix**: Add `php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &` before nginx in `start.sh`, or create a separate Render Background Worker.

**File**: [start.sh](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/start.sh)

---

### M2. Session/Cache/Queue Still on File/Database

| Driver | Current (.env) | Production Target |
|--------|---------------|-------------------|
| `CACHE_STORE` | `file` | `redis` |
| `QUEUE_CONNECTION` | `database` | `redis` |
| `SESSION_DRIVER` | `database` | `redis` |

**Fix**: Set Redis in the Render production env vars. Add `phpredis` or `predis` to Dockerfile if not already installed (currently `phpredis` client is configured but the extension isn't installed in the Dockerfile).

---

### M3. Missing Database Indexes

| Table | Missing Index | Query Pattern |
|-------|--------------|---------------|
| `payments` | `(tenancy_id, status, payment_type)` | Rent sum calculations |
| `payments` | `(paid_at)` | MTD revenue |
| `utility_bills` | `(status, due_date)` | Overdue scope |
| `tenancy_utilities` | `(tenancy_id, status)` | Active utility filter |

---

### M4. No Error Tracking Service

No Sentry, Flare, or Bugsnag configured. Production errors go to log files only — no alerting.

**Fix**: `composer require sentry/sentry-laravel`, publish config, set `SENTRY_LARAVEL_DSN` in production env.

---

### M5. CI Doesn't Verify Fresh Migration

Tests use `RefreshDatabase` but never run `php artisan migrate:fresh` from scratch. Migration ordering bugs are masked.

**Fix**: Add `php artisan migrate:fresh --force` step before tests in `.github/workflows/tests.yml`.

---

### M6. Inconsistent Error Response Shapes

API errors use `{'error': '...'}` in some places and `{'message': '...'}` in others. Mobile must handle both keys.

**Fix**: Standardize on `{'message': '...'}` (Laravel's convention) across all error responses.

---

## 🟢 LOW — Improve When Possible

### L1. Repo Root Junk Files (~6MB)

Delete every file in this table — all are development artifacts that should not ship:

| File | Size | Category |
|------|------|----------|
| `lint_results.json` | 1,857,634 bytes (1.8 MB) | Lint dump |
| `lint_results_v2.json` | 1,797,478 bytes (1.7 MB) | Lint dump |
| `lint_results_utf8.json` | 931,033 bytes (909 KB) | Lint dump |
| `failure_list.txt` | 66,488 bytes (65 KB) | Old test output |
| `test_results.txt` | 42,374 bytes (41 KB) | Old test output |
| `tests_output.txt` | 36,344 bytes (35 KB) | Old test output |
| `routes.txt` | 32,894 bytes (32 KB) | Route list dump |
| `final_failures.txt` | 13,068 bytes (13 KB) | Old test output |
| `routes_landlord.txt` | 10,814 bytes (11 KB) | Route list dump |
| `landlord_pages.txt` | 3,914 bytes (4 KB) | Page list dump |
| `2_README.md` | 2,507 bytes (2 KB) | Duplicate README |
| `debug_landlord_tenant_count.php` | 2,007 bytes (2 KB) | Ad-hoc debug script |
| `landlord_pages_utf8.txt` | 1,941 bytes (2 KB) | Page list dump |
| `test_logging.php` | 875 bytes | Throwaway test script |
| `test.php` | 184 bytes | Throwaway test script |
| **Total** | **~4.8 MB** | |

Also consider removing these non-essential root directories (verify first):

| Directory | Purpose |
|-----------|---------|
| `Board/` | Unknown — check contents |
| `plans/` | May duplicate `docs/plans/` |
| `screenshots/` | Dev screenshots — consider moving to `docs/` |
| `scripts/` | Check if used by CI or dev workflows |
| `hooks/` | Git hooks — check if `install-hooks.sh` is still needed |

Add to `.gitignore` to prevent recurrence:
```gitignore
# Dev artifacts
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

---

### L2. `.env.example` Says "Laravel" Instead of "Estate"

```env
APP_NAME=Laravel  # → should be APP_NAME=Estate
```

---

### L3. Duplicate Documentation File

`docs/user _flow _logic.md` (space in filename) still exists alongside `docs/user_flow_logic.md`. Delete the one with spaces.

---

### L4. Code Hygiene Nits

| File | Issue |
|------|-------|
| [User.php:73-79](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/User.php#L73) | Orphaned PHPDoc blocks (empty `$hidden` and `$casts` comments) |
| [Property.php:39-47](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/Property.php#L39) | Duplicate `owner()` / `landlord()` relationships (same FK) |
| [TenantIdentification.php](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Models/TenantIdentification.php) | Missing `HasFactory` trait (violates ArchTest rule) |
| [Tenant\DashboardController.php:93-96](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Http/Controllers/Api/Tenant/DashboardController.php#L93) | 500 response bypasses `data` wrapper |

---

### L5. Professional Polish

- **README.md**: Consolidate `2_README.md` into the main `README.md` with tech stack badges, setup instructions, and architecture overview.
- **CHANGELOG.md**: Start tracking — significant architectural work (payment refactoring, landing page, API standardization) is undocumented.
- **LICENSE**: Add one (proprietary or open-source).
- **API Docs**: Install `dedoc/scramble` for auto-generated OpenAPI docs from existing controllers.
- **No backup strategy**: Add `spatie/laravel-backup` for scheduled DB + file backups.

---

## Execution Timeline

### Week 1 — Stop the Bleeding (~2 hours)

| # | Task | Effort |
|---|------|--------|
| C1 | Patch exception leaks (Dashboard + audit 21 sites) | 45 min |
| C2 | Remove `db:seed --force` from start.sh | 5 min |
| C3 | Set Sanctum token expiration + add prune command | 15 min |
| C5 | Clean up render.yaml | 10 min |
| H3 | Fix password=username with random temp password | 30 min |
| L1 | Delete junk files + update .gitignore | 15 min |

### Week 2 — Structural Safety (~5 hours)

| # | Task | Effort |
|---|------|--------|
| C4 | Migration to change cascade → restrict on financial FKs | 1 hour |
| H1 | Wire policies into API controllers + add 403 tests | 3 hours |
| H2 | Add unique constraint + fix tenant_code generation | 30 min |
| M1 | Add queue:work to start.sh | 15 min |
| M5 | Add migrate:fresh to CI | 15 min |

### Week 3 — Performance & Quality (~4 hours)

| # | Task | Effort |
|---|------|--------|
| H4 | Refactor dashboard queries (extract property IDs) | 1 hour |
| H5 | Consolidate payment logic into service | 2 hours |
| M3 | Add missing indexes migration | 30 min |
| M6 | Standardize error response shapes | 30 min |

### Week 4 — Hardening & Polish (~3 hours)

| # | Task | Effort |
|---|------|--------|
| M2 | Switch to Redis (session/cache/queue) | 30 min |
| M4 | Install Sentry | 30 min |
| L5 | README, CHANGELOG, LICENSE, API docs | 1 hour |
| — | Web smoke tests for Inertia pages | 1 hour |

---

## Open Questions

> [!IMPORTANT]
> **1. Seeders**: What do your production seeders do? If they seed lookup data (utility types), we can keep a targeted `--class=UtilityTypeSeeder` with upsert logic. If they create demo data, removing from `start.sh` is mandatory.

> [!IMPORTANT]
> **2. Token refresh**: Does the mobile app handle 401 → re-authentication? Setting Sanctum expiration without a refresh flow will unexpectedly log users out.

> [!WARNING]
> **3. Cascade deletes**: Changing FK constraints on a production DB with existing data requires careful migration. Must test on staging first.

> [!NOTE]
> **4. Next step**: Should I start executing Week 1 fixes, or do you want to adjust priorities first?
