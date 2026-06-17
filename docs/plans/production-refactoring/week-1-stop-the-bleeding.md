# Week 1 — Stop the Bleeding (Agent Instructions)

> **Branch**: `refactor-production-readiness`
> **Goal**: Eliminate active security vulnerabilities and deployment risks before any traffic hits production.
> **Estimated effort**: ~2 hours

---

## Agent Ground Rules

These apply to every task in this file. Do not deviate.

1. **One task = one commit.** Commit after each task completes and tests pass. Do not batch tasks into a single commit.
2. **Run `php artisan test --compact --filter=<relevant>` after every PHP change.** If tests fail, fix them before moving on.
3. **Run `vendor/bin/pint --dirty --format agent` after every PHP file edit.** Never commit un-formatted PHP.
4. **Do not touch files unrelated to the current task.** If you notice another issue while working, note it but do not fix it inline.
5. **Do not delete or modify existing tests** unless the task explicitly says to update them.
6. **Use exact file paths.** The project root is `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice`.
7. **Read each target file before editing** — line numbers may have shifted since this plan was written.
8. **Create new test files with**: `php artisan make:test --pest {Name}` for feature tests.

---

## Task Index

| ID | Task | Risk | Commit after? |
|----|------|------|---------------|
| [L1](#l1-delete-junk-files--update-gitignore) | Delete junk files + update `.gitignore` | None | ✅ Yes |
| [C5](#c5-fix-renderyaml-dead-buildcommand) | Remove dead `buildCommand` from `render.yaml` | None | ✅ Yes |
| [C2](#c2-remove-dbseed---force-from-startsh) | Remove `db:seed --force` from `start.sh` | Low | ✅ Yes |
| [C1](#c1-patch-exception-internals-leaked-to-api-consumers) | Remove `getFile()`/`getLine()` from dashboard response | Low | ✅ Yes |
| [C3](#c3-set-sanctum-token-expiration) | Set Sanctum token expiration to 30 days | Medium | ✅ Yes |
| [H3](#h3-fix-passwordusername-on-tenant-creation) | Generate random temp password for new tenants | Low | ✅ Yes |

> **Execute in the order listed above.** Each task is independently committable.

---

## L1. Delete Junk Files + Update `.gitignore`

**Impact**: ~4.8 MB of development artifacts committed to the repo.
**PHP changes**: None. No tests needed. No pint needed.

### Step 1 — Read `DatabaseSeeder.php` first (needed for C2)

Before deleting anything, read this file and take note of what it seeds — you will need this for C2:

```
app path: database/seeders/DatabaseSeeder.php
```

### Step 2 — Delete files from repo root

Verify each file exists before running. Delete only these exact files:

```powershell
Remove-Item lint_results.json
Remove-Item lint_results_v2.json
Remove-Item lint_results_utf8.json
Remove-Item failure_list.txt
Remove-Item final_failures.txt
Remove-Item test_results.txt
Remove-Item tests_output.txt
Remove-Item routes.txt
Remove-Item routes_landlord.txt
Remove-Item landlord_pages.txt
Remove-Item landlord_pages_utf8.txt
Remove-Item debug_landlord_tenant_count.php
Remove-Item test_logging.php
Remove-Item test.php
Remove-Item 2_README.md
```

### Step 3 — Inspect these directories before touching them

**Do not delete these** until you have read their contents:

| Directory | What to check |
|-----------|--------------|
| `Board/` | List contents — if only dev notes, delete entirely |
| `plans/` | Check if files are duplicated in `docs/plans/`. If so, delete `plans/` |
| `screenshots/` | If dev-only, delete. If documentation, move to `docs/screenshots/` |

### Step 4 — Update `.gitignore`

File: `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice\.gitignore`

Append these lines at the end of the file (after line 29):

```gitignore

# -----------------------------------------------
# Dev artifact files — never commit these
# -----------------------------------------------
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

### Step 5 — Commit

```powershell
git add -A
git commit -m "chore: delete dev artifact files and update .gitignore"
```

---

## C5. Fix `render.yaml` Dead `buildCommand`

**Impact**: Dead configuration misleads future developers.
**PHP changes**: None. No tests needed. No pint needed.

### Background

`render.yaml` uses `env: docker`. When `env: docker` is set, Render ignores the `buildCommand` field entirely — the Dockerfile controls the full build. The field is dead code.

### Current file

`c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice\render.yaml` (full file, 11 lines):

```yaml
services:
  - type: web
    name: estate-practice
    env: docker
    buildCommand: composer install --no-interaction --no-dev
    startCommand: "/start.sh"
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: "false"
```

### Exact replacement

Replace the entire file with:

```yaml
services:
  - type: web
    name: estate-practice
    env: docker
    # NOTE: 'buildCommand' is ignored when env: docker. The Dockerfile controls
    # the full build (composer install, npm install, npm run build). Do not add it.
    startCommand: "/start.sh"
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: "false"
```

### Commit

```
git add render.yaml
git commit -m "fix(deploy): remove dead buildCommand from render.yaml"
```

---

## C2. Remove `db:seed --force` from `start.sh`

**Impact**: Prevents potential data corruption on every container restart.
**PHP changes**: None. No pint needed.

### Decision required before editing

You read `DatabaseSeeder.php` in L1 Step 1. Apply this decision tree:

| If `DatabaseSeeder` calls... | Action |
|------------------------------|--------|
| Only lookup/reference seeders that use `updateOrCreate` or `firstOrCreate` internally | Replace line 16 with: `php artisan db:seed --class=UtilityTypeSeeder --force` |
| Any seeder that creates demo/sample data (tenants, properties, payments) | Remove line 16 entirely |
| Anything else or you are unsure | Remove line 16 entirely (safest option) |

### Current `start.sh` (full file, 27 lines)

```sh
#!/bin/sh

# Generate storage link if not exists
if [ ! -L /app/public/storage ]; then
    php artisan storage:link 2>/dev/null || true
fi

# Link Render secret file to Laravel's directory
if [ -f /etc/secrets/.env ]; then
    cp /etc/secrets/.env /app/.env
fi

# Run Database Migrations and Seeds
# We use --force because this is a production-like environment
php artisan migrate --force
php artisan db:seed --force          # ← LINE 16 — REMOVE OR REPLACE

# Clear and warm cache
php artisan config:cache 
php artisan route:cache 
php artisan view:cache 

# Start PHP-FPM in background
php-fpm &

# Start Nginx in foreground
nginx -g 'daemon off;'
```

### Edited section (lines 13–16)

**Remove** line 16 and update the comment:

```sh
# Run Database Migrations
# Seeds are not run on boot — run targeted seeders manually if needed.
php artisan migrate --force
```

### Commit

```
git add start.sh
git commit -m "fix(deploy): remove db:seed --force from boot sequence"
```

---

## C1. Patch Exception Internals Leaked to API Consumers

**Impact**: Server file paths and source line numbers are exposed in JSON responses.
**Files to edit**: 1 controller (the only real problem — all others audited as safe).

### Pre-edit audit (verify these are safe — read before editing)

Before touching anything, verify the following files already return static strings in their `catch (\Exception $e)` blocks, with `getMessage()` only in the `Log::error()` context (not in the response):

| File | Lines | Expected state |
|------|-------|----------------|
| `app/Http/Controllers/Api/Landlord/TenancyUtilityController.php` | ~128, ~242, ~290 | `getMessage()` in Log only, static `'message'` in response |
| `app/Http/Controllers/Api/Landlord/UtilityBillController.php` | ~233, ~286 | `getMessage()` in Log only, static `'message'` in response |
| `app/Http/Controllers/Concerns/HandlesReceipts.php` | ~28 | `getMessage()` in Log only, static `'message'` in response |
| `app/Http/Controllers/Api/Tenant/PaymentsController.php` | ~306 | `getMessage()` in Log only, static string `'error'` in response |
| `app/Http/Controllers/Web/Landlord/LandlordPaymentController.php` | ~160, ~202, ~241 | Web controller — static flash message, no JSON response |

If any of those files leak `getMessage()` directly into the response, fix them too using the same pattern shown below. If they're already safe, leave them alone.

### The only confirmed broken file

**File**: `app/Http/Controllers/Api/Landlord/DashboardController.php`
**Lines**: 187–193 (verify exact lines before editing)

**Current broken code**:
```php
} catch (\Exception $e) {
    return response()->json([
        'message' => 'Error fetching dashboard data',
        'error'   => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
    ], 500);
}
```

**Replace with**:
```php
} catch (\Exception $e) {
    Log::error('Dashboard data fetch failed', [
        'landlord_id' => $request->user()?->id,
        'error'       => $e->getMessage(),
        'trace'       => $e->getTraceAsString(),
    ]);

    return response()->json([
        'message' => 'Unable to load dashboard data. Please try again.',
    ], 500);
}
```

Verify that `use Illuminate\Support\Facades\Log;` is already imported at the top of `DashboardController.php`. If not, add it.

### Run pint

```powershell
vendor/bin/pint app/Http/Controllers/Api/Landlord/DashboardController.php --format agent
```

### Test

Check if a test already exists for this endpoint at `tests/Feature/Api/Landlord/`. If a `DashboardTest.php` exists, add the following test to it. If it does not exist, create it:

```powershell
php artisan make:test --pest Api/Landlord/DashboardExceptionLeakTest
```

Test content:

```php
<?php

use App\Models\User;
use App\Enums\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('does not expose exception internals in dashboard error response', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    // The dashboard catches all exceptions — force a failure by injecting bad state
    // Use a raw DB connection drop simulation or simply assert the structure on a real call
    $response = $this->actingAs($landlord, 'sanctum')
        ->getJson('/api/v1/landlord/dashboard');

    // On success, ensure no debug keys are present
    $response->assertJsonMissingExact(['file' => null])
             ->assertJsonMissing(['file', 'line']);
});
```

> **Note**: A deep mock-based test for this is complex. The minimum acceptable test is asserting the response never contains `file` or `line` keys. Add this to the existing dashboard test suite if one exists.

### Run tests

```powershell
php artisan test --compact --filter=Dashboard
```

All tests must pass before committing.

### Commit

```
git add app/Http/Controllers/Api/Landlord/DashboardController.php tests/
git commit -m "fix(security): remove exception file/line leak from dashboard API response"
```

---

## C3. Set Sanctum Token Expiration

**Impact**: API tokens currently never expire. A stolen token is valid permanently.
**⚠️ Coordination note**: Before merging this to production, confirm with the mobile team that the app handles `401 Unauthenticated` by clearing credentials and redirecting to login.

### Step 1 — Edit `config/sanctum.php`

**File**: `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice\config\sanctum.php`
**Line 53** (verify):

**Current**:
```php
'expiration' => null,
```

**Replace with**:
```php
// Tokens expire after 30 days (value in minutes). Override per-environment via .env.
// Mobile app MUST handle 401 responses by clearing credentials and redirecting to login.
'expiration' => env('SANCTUM_TOKEN_EXPIRY_MINUTES', 60 * 24 * 30),
```

### Step 2 — Add prune schedule to `bootstrap/app.php`

**File**: `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice\bootstrap\app.php`
**Lines 37–39** (verify):

**Current**:
```php
->withSchedule(function (Schedule $schedule): void {
    $schedule->command('receipts:cleanup')->weekly();
})
```

**Replace with**:
```php
->withSchedule(function (Schedule $schedule): void {
    $schedule->command('receipts:cleanup')->weekly();
    // Prune expired Sanctum tokens daily. Hours must match expiration minutes / 60.
    $schedule->command('sanctum:prune-expired --hours=720')->daily();
})
```

### Step 3 — Add env var to `.env.example`

**File**: `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice\.env.example`

Find the `SANCTUM_STATEFUL_DOMAINS` line and add after it:

```env
SANCTUM_TOKEN_EXPIRY_MINUTES=43200  # 30 days — mobile app must handle 401 → re-login
```

If you cannot find that line, add to the bottom of the file.

### Step 4 — Run pint

```powershell
vendor/bin/pint config/sanctum.php bootstrap/app.php --format agent
```

### Step 5 — Run tests

```powershell
php artisan test --compact --filter=Sanctum
```

If no Sanctum-specific tests exist, run the full suite to check for regressions:

```powershell
php artisan test --compact
```

### Commit

```
git add config/sanctum.php bootstrap/app.php .env.example
git commit -m "fix(security): set Sanctum token expiration to 30 days with daily prune schedule"
```

---

## H3. Fix Password = Username on Tenant Creation

**Impact**: Every new tenant created via the landlord portal has a trivially guessable initial password (it equals their username).

### Step 1 — Read `app/Models/User.php` first

Before writing the migration, read the full `User.php` model to understand:
- What columns are in `$fillable` or guarded
- How the `casts()` method is structured (check for a `casts()` method vs `$casts` property)
- Whether `must_change_password` is already present (it should not be)

### Step 2 — Read `database/migrations` to find the users migration

Run this to find the current users migration:

```powershell
php artisan db:show --tables
```

Or use the database-schema tool to inspect the `users` table and confirm `must_change_password` does not already exist.

### Step 3 — Create the migration

```powershell
php artisan make:migration add_must_change_password_to_users_table --table=users
```

Fill in the generated migration file. Add the column **after** `password`:

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table): void {
        $table->boolean('must_change_password')->default(false)->after('password');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table): void {
        $table->dropColumn('must_change_password');
    });
}
```

Run the migration:

```powershell
php artisan migrate
```

### Step 4 — Update `app/Models/User.php`

**4a. Add `must_change_password` to `$fillable`.**

Find the `$fillable` array and add `'must_change_password'` to it.

**4b. Add the cast.**

Find the `casts()` method (or `$casts` array — match whichever pattern already exists in the file) and add:

```php
'must_change_password' => 'boolean',
```

### Step 5 — Update `app/Services/TenantService.php`

**File**: `c:\Users\Admin\Desktop\SurveyCorps\Projects\estate-practice\app\Services\TenantService.php`

**5a. Add import at the top** (if not already present):

```php
use Illuminate\Support\Str;
```

**5b. Find the `User::create()` block** (around line 78) and make these changes:

Add `$tempPassword = Str::random(12);` immediately before the `User::create()` call.

Change the `User::create()` array:
- Replace `'password' => $username` with `'password' => $tempPassword`
- Add `'must_change_password' => true`

**5c. Find the `credentials` return array** (around line 110) and change:
- Replace `'password' => $username` with `'password' => $tempPassword`

**Full edited block for reference** (read the actual file first to confirm exact lines):

```php
// 2. Create User Account
$username = $this->generateUniqueUsername($tenant->full_name);
$tempPassword = Str::random(12);

$user = User::create([
    'name'                 => $tenant->full_name,
    'username'             => $username,
    'email'                => $tenant->email,
    'password'             => $tempPassword,
    'role'                 => 'tenant',
    'tenant_id'            => $tenant->id,
    'must_change_password' => true,
]);
```

```php
'credentials' => [
    'username' => $username,
    'password' => $tempPassword,   // returned once in plaintext; never stored in plain form again
],
```

### Step 6 — Run pint

```powershell
vendor/bin/pint app/Services/TenantService.php app/Models/User.php --format agent
```

### Step 7 — Find existing TenantService tests

Search for existing tests:

```powershell
php artisan test --compact --filter=TenantService
```

If a `TenantServiceTest` exists, check if it asserts on `credentials['password']`. If it does, update the assertion:

```php
// Old assertion (will fail after this change):
expect($result['credentials']['password'])->toBe($result['credentials']['username']);

// New assertion:
expect($result['credentials']['password'])
    ->not->toBe($result['credentials']['username'])
    ->toHaveLength(12);
expect($result['user']->must_change_password)->toBeTrue();
```

If no test covers this, create one:

```powershell
php artisan make:test --pest TenantServicePasswordTest
```

Test body:

```php
<?php

use App\Models\User;
use App\Enums\Role;
use App\Services\TenantService;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('generates a random temp password different from the username for new tenants', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);
    $property = \App\Models\Property::factory()->create(['owner_id' => $landlord->id]);
    $unit = \App\Models\Unit::factory()->create(['property_id' => $property->id]);

    $result = app(TenantService::class)->createTenantWithTenancy([
        'full_name'    => 'John Doe',
        'email'        => 'john@example.com',
        'phone'        => '0700000000',
        'unit_id'      => $unit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 15000,
        'security_deposit' => 5000,
    ]);

    expect($result['credentials']['password'])
        ->not->toBe($result['credentials']['username'])
        ->toHaveLength(12);

    expect($result['user']->must_change_password)->toBeTrue();
    expect($result['user']->must_change_password)->not->toBe($result['credentials']['username']);
});

it('sets must_change_password to true for all new tenants', function (): void {
    // Ensure the flag is persisted to the DB, not just on the in-memory model
    $landlord = User::factory()->create(['role' => Role::Landlord]);
    $property = \App\Models\Property::factory()->create(['owner_id' => $landlord->id]);
    $unit = \App\Models\Unit::factory()->create(['property_id' => $property->id]);

    $result = app(TenantService::class)->createTenantWithTenancy([
        'full_name'    => 'Jane Smith',
        'email'        => 'jane@example.com',
        'phone'        => '0711111111',
        'unit_id'      => $unit->id,
        'move_in_date' => now()->toDateString(),
        'monthly_rent' => 12000,
        'security_deposit' => 4000,
    ]);

    $this->assertDatabaseHas('users', [
        'id'                   => $result['user']->id,
        'must_change_password' => true,
    ]);
});
```

> **Adjust factory calls** to match the actual factory signatures in this project. Read `database/factories/TenantFactory.php`, `PropertyFactory.php`, and `UnitFactory.php` first.

### Step 8 — Run tests

```powershell
php artisan test --compact --filter=TenantService
```

All tests must pass. If existing tests fail due to the password change, update only the affected assertions.

### Commit

```
git add app/Services/TenantService.php app/Models/User.php database/migrations/ tests/
git commit -m "fix(security): generate random temp password for new tenants, add must_change_password flag"
```

---

## Final Verification (run after all tasks)

```powershell
# 1. Full test suite
php artisan test --compact

# 2. Pint check (should be clean — all files formatted per-task)
vendor/bin/pint --dirty --format agent

# 3. Confirm no debug keys in git index
git diff --cached --stat
```

### Manual checklist

- [ ] `start.sh` does not contain `db:seed`
- [ ] `render.yaml` does not contain `buildCommand`
- [ ] `config/sanctum.php` `expiration` is not `null`
- [ ] `bootstrap/app.php` scheduler includes `sanctum:prune-expired`
- [ ] `DashboardController.php` catch block contains no `getFile()` or `getLine()`
- [ ] `TenantService.php` uses `Str::random(12)` not `$username` for password
- [ ] `users` table has `must_change_password` column
- [ ] Repo root contains none of the files listed in L1
- [ ] `.gitignore` contains the dev artifact patterns
- [ ] All 6 commits are on `refactor-production-readiness` branch

### Push

```powershell
git push origin refactor-production-readiness
```
