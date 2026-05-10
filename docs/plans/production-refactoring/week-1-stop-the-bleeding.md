# Week 1 — Stop the Bleeding

> **Branch**: `refactor-production-readiness`
> **Goal**: Eliminate active security vulnerabilities and deployment risks before any traffic hits production.
> **Estimated total effort**: ~2 hours
> **Prerequisite**: All changes must pass `php artisan test --compact` before committing.

---

## Task Index

| ID | Task | File(s) | Effort | Risk |
|----|------|---------|--------|------|
| [C1](#c1-patch-exception-internals-leaked-to-api-consumers) | Patch exception leaks | 5 controllers + 1 trait | 45 min | Low |
| [C2](#c2-remove-dbseed---force-from-startsh) | Remove `db:seed --force` from boot | `start.sh` | 5 min | Low |
| [C3](#c3-set-sanctum-token-expiration) | Set Sanctum token expiration | `config/sanctum.php`, `bootstrap/app.php` | 15 min | Medium* |
| [C5](#c5-fix-renderyaml-dead-buildcommand) | Fix `render.yaml` dead config | `render.yaml` | 5 min | None |
| [H3](#h3-fix-passwordusername-on-tenant-creation) | Fix password = username | `TenantService.php` | 30 min | Low |
| [L1](#l1-delete-junk-files--update-gitignore) | Delete junk files + `.gitignore` | repo root, `.gitignore` | 15 min | None |

> *C3 risk: coordinate with mobile team — existing tokens will expire 30 days after deploy. New sessions get expiring tokens immediately.

---

## C1. Patch Exception Internals Leaked to API Consumers

### Background

Raw `$e->getMessage()`, `$e->getFile()`, and `$e->getLine()` values are being returned directly in JSON responses. This leaks server-side file paths, class names, and stack line numbers to any authenticated API consumer.

There are **two categories** of `getMessage()` usage — only one is a problem:

| Category | Example | Action |
|----------|---------|--------|
| ✅ **Safe** — domain exception, caught specifically | `catch (\InvalidArgumentException $e)` | Keep — message is intentional user feedback |
| ❌ **Unsafe** — generic exception, message in response | `catch (\Exception $e)` + `'error' => $e->getMessage()` | Replace with static message, log original |

### Sites to fix (8 locations)

#### 1. `Api\Landlord\DashboardController` — Lines 187–193 🔴 WORST CASE

**Current** (leaks file path + line number):
```php
} catch (\Exception $e) {
    return response()->json([
        'message' => 'Error fetching dashboard data',
        'error'   => $e->getMessage(),
        'file'    => $e->getFile(),    // ← server path
        'line'    => $e->getLine(),    // ← source line
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

---

#### 2. `Api\Tenant\PaymentsController` — Line 309

**Current**:
```php
} catch (\Exception $e) {
    Log::error('Failed to process payment via API', [
        'tenant_id' => $tenant->id,
        'error'     => $e->getMessage(),
    ]);

    return response()->json([
        'error' => 'Failed to process payment. Please try again.',
    ], 500);
```

> ✅ The `Log::error()` here is already correct. The response on line 313 already returns a static string.
> **Only change**: rename the response key from `'error'` → `'message'` for consistency (see M6).

---

#### 3. `Api\Landlord\UtilityBillController` — Lines 233–241 and 286–294

**Current (update method, line 233)**:
```php
} catch (\Exception $e) {
    Log::error('Failed to update utility bill', [
        'utility_bill_id' => $utilityBill->id,
        'error'           => $e->getMessage(),
    ]);

    return response()->json([
        'message' => 'Failed to update utility bill',
    ], 500);
}
```
> ✅ This one is already correct — `getMessage()` only goes to the log, not the response. **No change needed.**

**Current (waive method, line 286)**:
```php
} catch (\Exception $e) {
    Log::error('Failed to waive utility bill', [
        'utility_bill_id' => $utilityBill->id,
        'error'           => $e->getMessage(),
    ]);

    return response()->json([
        'message' => 'Failed to waive utility bill',
    ], 500);
}
```
> ✅ Also already correct. **No change needed.**

---

#### 4. `Api\Landlord\TenancyUtilityController` — Lines 128–137, 238–248, 286–295

**Current (store method, line 128)**:
```php
} catch (\Exception $e) {
    Log::error('Failed to assign utility to tenancy', [
        'tenancy_id' => $tenancy->id,
        'error'      => $e->getMessage(),
    ]);

    return response()->json([
        'message' => 'Failed to assign utility',
    ], 500);
}
```
> ✅ Already correct — message in log only. Check lines 238 and 290 follow the same pattern.

---

#### 5. `Api\Tenant\PaymentsController` — Line 233 ✅ SAFE — keep

```php
} catch (\InvalidArgumentException $e) {
    return response()->json(['error' => $e->getMessage()], 422);
}
```
> ✅ This is a **domain exception** (`InvalidArgumentException`), intentionally thrown by `UtilityService` with a user-facing message. Keep as-is. Only rename key `'error'` → `'message'` (M6 task).

---

#### 6. `App\Http\Controllers\Concerns\HandlesReceipts` — Line 31 ✅ SAFE — keep

```php
} catch (\Exception $e) {
    Log::error('Receipt generation failed', [
        'payment_id' => $payment->id,
        'error'      => $e->getMessage(),
        'trace'      => $e->getTraceAsString(),
    ]);

    return response()->json(['message' => 'Failed to generate receipt.'], 500);
}
```
> ✅ Already correct — `getMessage()` goes to the log, static message in response. **No change needed.**

---

#### 7. `Web\Landlord\LandlordPaymentController` — Lines 160–170, 202–212, 241–250

These are Web controllers returning `redirect()->back()->with('error', ...)` — the user never sees the raw exception. However, `$e->getMessage()` appears in the `Log::error()` context array, which is safe (logs are server-side).
> ✅ All three already log correctly and return static user-facing messages via flash. **No change needed.**

---

### Summary of actual changes for C1

| File | Change |
|------|--------|
| `Api\Landlord\DashboardController.php:187-193` | Remove `'file'` and `'line'` keys; add proper `Log::error()` with context |
| All other sites | Already safe — `getMessage()` only in logs, static strings in responses |

### Test to write

```php
// tests/Feature/Api/Landlord/DashboardTest.php
it('does not leak exception internals in error response', function () {
    // Force a DB error by mocking
    $this->mock(\Illuminate\Database\DatabaseManager::class)
         ->shouldReceive('select')->andThrow(new \Exception('SQLSTATE[HY000] server/path.php:42'));

    $response = $this->actingAs($landlord, 'sanctum')->getJson('/api/v1/landlord/dashboard');

    $response->assertStatus(500)
             ->assertJsonMissing(['file', 'line', 'trace'])
             ->assertJsonStructure(['message']);
});
```

---

## C2. Remove `db:seed --force` from `start.sh`

### Background

`start.sh` line 16 runs `php artisan db:seed --force` on **every** container boot. On Render, this fires on every deploy and every crash recovery restart. If seeders are not idempotent, this will corrupt data.

### Current `start.sh`

```sh
# Run Database Migrations and Seeds
# We use --force because this is a production-like environment
php artisan migrate --force
php artisan db:seed --force          # ← REMOVE THIS LINE
```

### Change

**Remove line 16 entirely.** `php artisan migrate --force` is safe to run repeatedly (Laravel tracks executed migrations). `db:seed --force` is not.

**If lookup table seeding is required** (e.g., `UtilityTypeSeeder`), replace with a targeted, idempotent call:

```sh
php artisan migrate --force
# Only seed lookup/reference data using updateOrCreate internally:
php artisan db:seed --class=UtilityTypeSeeder --force
```

> **Before making this change**: Confirm with the team what `DatabaseSeeder.php` calls. If it runs demo-data seeders (`TenantSeeder`, `PaymentSeeder`, etc.), remove the line entirely. If it only runs reference-data seeders that use `updateOrCreate`, the targeted approach above is safe.

### Files

- [`start.sh:16`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/start.sh#L16)
- [`database/seeders/DatabaseSeeder.php`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/database/seeders/DatabaseSeeder.php) — audit this first

---

## C3. Set Sanctum Token Expiration

### Background

`config/sanctum.php` line 53 has `'expiration' => null`, meaning API tokens issued to mobile clients **never expire**. A stolen token provides permanent access. Old tokens from uninstalled apps accumulate forever.

### Step 1 — Set expiration in `config/sanctum.php`

**Current (line 53)**:
```php
'expiration' => null,
```

**Replace with**:
```php
// Tokens expire after 30 days (in minutes). Mobile app must handle 401 → re-login.
'expiration' => env('SANCTUM_TOKEN_EXPIRY_MINUTES', 60 * 24 * 30),
```

Using `env()` allows overriding per-environment without a code change.

### Step 2 — Add prune job to scheduler in `bootstrap/app.php`

**Current (line 37–39)**:
```php
->withSchedule(function (Schedule $schedule): void {
    $schedule->command('receipts:cleanup')->weekly();
})
```

**Replace with**:
```php
->withSchedule(function (Schedule $schedule): void {
    $schedule->command('receipts:cleanup')->weekly();
    // Prune expired Sanctum tokens daily (matches 30-day expiry window)
    $schedule->command('sanctum:prune-expired --hours=720')->daily();
})
```

### Step 3 — Add env var to `.env.example`

Add to the Sanctum section of `.env.example`:
```env
SANCTUM_TOKEN_EXPIRY_MINUTES=43200   # 30 days
```

### ⚠️ Coordination Required

Setting expiration affects **existing issued tokens**. Tokens issued before this deploy will begin expiring 30 days after the deploy date. The mobile app must:
1. Detect `401 Unauthenticated` responses.
2. Clear local credentials and redirect to the login screen.

Confirm with the mobile team that this flow already exists before deploying C3 to production.

### Files

- [`config/sanctum.php:53`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/config/sanctum.php#L53)
- [`bootstrap/app.php:37`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/bootstrap/app.php#L37)
- [`.env.example`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/.env.example)

---

## C5. Fix `render.yaml` Dead `buildCommand`

### Background

`render.yaml` uses `env: docker`, which instructs Render to build using the `Dockerfile` exclusively. In this mode, the `buildCommand` field is **completely ignored** by Render. It is dead configuration that will mislead future developers into editing it expecting results.

### Current `render.yaml`

```yaml
services:
  - type: web
    name: estate-practice
    env: docker
    buildCommand: composer install --no-interaction --no-dev   # ← DEAD CODE
    startCommand: "/start.sh"
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: "false"
```

### Change

Remove `buildCommand` entirely and add an explanatory comment:

```yaml
services:
  - type: web
    name: estate-practice
    env: docker
    # Build is handled entirely by the Dockerfile (composer install, npm build, etc.)
    # The 'buildCommand' field is ignored when env: docker — do not add it here.
    startCommand: "/start.sh"
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: "false"
```

### Files

- [`render.yaml`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/render.yaml)

---

## H3. Fix Password = Username on Tenant Creation

### Background

`TenantService::createTenantWithTenancy()` sets the tenant user's initial password to the same value as their auto-generated username (e.g., `john.doe837`). The username is returned in the API response, so the password is trivially known to anyone who intercepts the credentials response.

### Current code (`TenantService.php:77-85`)

```php
$username = $this->generateUniqueUsername($tenant->full_name);
$user = User::create([
    'name'      => $tenant->full_name,
    'username'  => $username,
    'email'     => $tenant->email,
    'password'  => $username,           // ← username == password
    'role'      => 'tenant',
    'tenant_id' => $tenant->id,
]);
```

**Current credentials return (`TenantService.php:110-113`)**:
```php
'credentials' => [
    'username' => $username,
    'password' => $username,   // ← plaintext identical to username
],
```

### Step 1 — Update the `users` table

A `must_change_password` boolean column is needed:

```bash
php artisan make:migration add_must_change_password_to_users_table --table=users
```

Migration content:
```php
Schema::table('users', function (Blueprint $table) {
    $table->boolean('must_change_password')->default(false)->after('password');
});
```

### Step 2 — Update `TenantService.php`

**Replace lines 77–85 and 110–113 with**:

```php
$username = $this->generateUniqueUsername($tenant->full_name);
$tempPassword = Str::random(12);   // ← cryptographically random

$user = User::create([
    'name'                 => $tenant->full_name,
    'username'             => $username,
    'email'                => $tenant->email,
    'password'             => $tempPassword,   // Cast handles hashing
    'role'                 => 'tenant',
    'tenant_id'            => $tenant->id,
    'must_change_password' => true,
]);
```

And the credentials return:
```php
'credentials' => [
    'username' => $username,
    'password' => $tempPassword,   // returned ONCE in plaintext; never stored again
],
```

Add the `Str` import at the top of the file if not already present:
```php
use Illuminate\Support\Str;
```

### Step 3 — Update `User` model

Add `must_change_password` to `$fillable` (or remove it from `$guarded`) and add a cast:

```php
// In User.php casts() method
'must_change_password' => 'boolean',
```

### Step 4 — Enforce on mobile login (future gate)

The `must_change_password` flag should be returned in the login response so the mobile app can redirect to a change-password screen. This is a future task — for now, the flag is stored and returned as part of the user profile. Document this in the mobile team's backlog.

Add `must_change_password` to the login/profile API response:

```php
// In Api\AuthController or wherever user profile is returned:
'must_change_password' => $user->must_change_password,
```

### Test to write

```php
// tests/Feature/TenantServiceTest.php
it('generates a random password different from the username on tenant creation', function () {
    $result = app(TenantService::class)->createTenantWithTenancy([...]);

    expect($result['credentials']['password'])
        ->not->toBe($result['credentials']['username'])
        ->toHaveLength(12);

    expect($result['user']->must_change_password)->toBeTrue();
});
```

### Files

- [`app/Services/TenantService.php:77-85, 110-113`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/app/Services/TenantService.php#L77)
- `app/Models/User.php` — add `must_change_password` to fillable/casts
- New migration: `add_must_change_password_to_users_table`

---

## L1. Delete Junk Files + Update `.gitignore`

### Files to delete from repo root

Run these deletions (verify each exists first):

```powershell
# Lint dumps (~4.6 MB)
Remove-Item lint_results.json, lint_results_v2.json, lint_results_utf8.json

# Test output artifacts
Remove-Item failure_list.txt, final_failures.txt, test_results.txt, tests_output.txt

# Route/page list dumps
Remove-Item routes.txt, routes_landlord.txt, landlord_pages.txt, landlord_pages_utf8.txt

# Dev scripts
Remove-Item debug_landlord_tenant_count.php, test_logging.php, test.php

# Duplicate README
Remove-Item 2_README.md
```

Then stage the deletions:
```powershell
git add -A
```

### Update `.gitignore`

Add to the bottom of `.gitignore`:

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

### Directories to manually review before deleting

These directories may contain useful content — check before removing:

| Directory | Check before deleting |
|-----------|----------------------|
| `Board/` | Open and inspect — unknown purpose |
| `plans/` | Verify all content is duplicated in `docs/plans/` |
| `screenshots/` | Move to `docs/screenshots/` if worth keeping |

### Files

- All files listed above in repo root
- [`.gitignore`](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate-practice/.gitignore)

---

## Execution Order

Run tasks in this order to minimize risk and ensure each can be tested independently:

```
L1  → no code changes, safe to do first
C5  → 2-line config change, zero risk
C2  → 1-line removal from start.sh
C1  → targeted Dashboard fix (8 lines), run tests after
C3  → sanctum + scheduler change, coordinate with mobile first
H3  → migration + service change, requires test update
```

## Verification Checklist

After all tasks are complete:

- [ ] `php artisan test --compact` — all tests pass
- [ ] `vendor/bin/pint --dirty` — no PHP style violations
- [ ] `git diff --stat` — no unexpected files changed
- [ ] API response for a forced 500 on `/api/v1/landlord/dashboard` contains `message` but no `file`, `line`, or stack trace
- [ ] New tenant created via API has `must_change_password = true` and `password !== username`
- [ ] `start.sh` no longer contains `db:seed`
- [ ] `render.yaml` no longer contains `buildCommand`
- [ ] Repo root is clean of all junk files listed in L1
