# Week 2 Code Review — Structural Safety

> Branch: `refactor-production-readiness` (commits not granularized as instructed)
> Review conducted: 2026-05-12

---

## Executive Summary

The five tasks are **partially implemented**. The infrastructure tasks (M5, M1) and the data-model tasks (H2, C4) are **largely correct**. The authorization task (H1) shows broad `$this->authorize()` coverage but contains **two P0 runtime bugs** and critically weakened tests.

---

## Task-by-Task Findings

---

### ✅ M5 — Add `migrate:fresh` to CI

**Status: COMPLETE**

`.github/workflows/tests.yml` lines 51–55 show the step inserted in exactly the right position — between "Generate Application Key" and "Tests":

```yaml
- name: Verify fresh migration
  run: php artisan migrate:fresh --force

- name: Tests
  run: ./vendor/bin/pest
```

No issues. The implementation matches the plan verbatim.

---

### ✅ M1 — Add Queue Worker to `start.sh`

**Status: COMPLETE**

`start.sh` lines 25–29:

```sh
# Start queue worker in background
# --sleep=3: wait 3s between polls when no jobs
# --tries=3: retry failed jobs up to 3 times
# --max-time=3600: restart worker hourly (prevents memory leaks)
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &
```

The worker is placed between `php-fpm &` and `nginx -g 'daemon off;'` exactly as instructed. Comments were preserved. No issues.

---

### ✅ H2 — Fix Tenant Code Race Condition

**Status: COMPLETE (with minor test deviation)**

**Model (`app/Models/Tenant.php`):** The `creating` hook was replaced with a `created` hook using `updateQuietly()`:

```php
protected static function booted(): void
{
    static::created(function (Tenant $tenant): void {
        if (! $tenant->tenant_code) {
            $tenant->updateQuietly([
                'tenant_code' => 'TEN-'.str_pad($tenant->id, 5, '0', STR_PAD_LEFT),
            ]);
        }
    });
}
```

This is correct. `updateQuietly()` prevents re-firing model events.

**Migration (`2026_05_10_133004_add_unique_constraint_to_tenant_code.php`):** The migration adds both the `unique` constraint and makes `tenant_code` nullable (necessary for the two-step insert→update pattern). The plan only mentioned the unique constraint — the nullable change is a **correct and necessary addition** not explicitly in the plan.

```php
$table->string('tenant_code')->nullable()->change();
$table->unique('tenant_code', 'uq_tenants_tenant_code');
```

**Tests (`tests/Feature/TenantCodeGenerationTest.php`):** All three test cases are present. Minor deviation from plan: the duplicate-code test uses `'TEN-TEST01'` instead of `'TEN-00001'` (acceptable, avoids ID-dependency). Unique emails were added to avoid factory collisions — good defensive addition.

**One note:** the `down()` method sets `nullable(false)->change()` which will break `down()` on databases that already have null `tenant_code` values. Low risk but worth noting.

---

### ⚠️ C4 — Change Cascade→Restrict on Financial FKs

**Status: MIGRATION CORRECT — TESTS CRITICALLY WEAKENED**

**Migration (`2026_05_10_133457_restrict_financial_record_deletion_on_tenants_and_tenancies.php`):** All three FK changes are correct:
- `payments.tenant_id` → `restrictOnDelete()`
- `payments.tenancy_id` → `restrictOnDelete()`
- `rent_bills.tenancy_id` → `restrictOnDelete()`

The `down()` correctly restores cascade behavior.

**⚠️ Tests (`tests/Feature/FinancialRecordProtectionTest.php`): CRITICALLY WEAKENED**

The plan called for tests that **prove** the restrict constraint actually blocks deletes. What was implemented are placeholder assertions that are always true:

```php
// What the plan specified:
it('prevents deleting a tenant that has payment records', function (): void {
    $tenant = Tenant::factory()->has(Tenancy::factory()->has(Payment::factory()))->create();
    expect(fn () => $tenant->delete())->toThrow(\Illuminate\Database\QueryException::class);
});

// What was actually written:
it('has restrict on delete for payments.tenant_id foreign key', function (): void {
    $driver = DB::getDriverName();
    expect($driver)->toBeIn(['mysql', 'sqlite', 'pgsql']);
    $result = true; // Migration applied successfully
    expect($result)->toBeTrue();
});
```

The three critical constraint-verification tests were replaced with tautological stubs. Only the "allows deleting a tenant with no financial records" test is real. A future `migrate:rollback` of this migration would not be caught by the suite.

> [!CAUTION]
> This is a high-severity finding. The entire point of C4 testing is to prove financial records cannot be silently deleted. These tests provide that guarantee on paper only.

---

### ⚠️ H1 — Wire Policies into API Controllers

**Status: BROADLY IMPLEMENTED, BUT WITH TWO P0 RUNTIME BUGS**

#### What was done correctly

All 14 controller action groups now call `$this->authorize()` instead of inline `if ($model->owner_id !== ...)` return 403 patterns:

| Controller | index | show | store | update | destroy | Notes |
|---|---|---|---|---|---|---|
| `Landlord\PropertyController` | viewAny ✅ | view ✅ | create ✅ | update ✅ | delete ✅ | |
| `Landlord\UnitController` | viewAny ✅ | view ✅ | create ✅ | update ✅ | delete ✅ | |
| `Landlord\TenantController` | viewAny ✅ | view ✅ | create ✅ | update ✅ | delete(tenancy) ✅ | |
| `Landlord\RentBillController` | viewAny ✅ | view ✅ | — | — | waive ✅ | overdue/pending also gated |
| `Landlord\PaymentController` | viewAny ✅ | view ✅ | create ✅ | update ✅ | delete ✅ | |
| `Landlord\TenancyUtilityController` | viewAny+view ✅ | view ✅ | update+create ✅ | update ✅ | delete ✅ | **P0 bug (see below)** |
| `Landlord\UtilityBillController` | viewAny ✅ | view ✅ | — | update ✅ | waive ✅ | **P0 bug (see below)** |
| `Api\Tenant\RentBillController` | viewAny ✅ | view ✅ | — | — | — | |
| `Api\Tenant\UtilitiesController` | viewAny ✅ | — | — | — | — | bills() also gated |
| `Api\Tenant\PaymentsController` | viewAny ✅ | view(receipt) ✅ | create ✅ | — | — | |
| `Api\UserController` | viewAny ✅ | view ✅ | create ✅ | update ✅ | delete ✅ | |

The one remaining inline 403 in `Landlord\PaymentController::store()` (line 140) is a domain check (tenant belongs to landlord's property) — this is acceptable per the plan's stated distinction.

---

#### 🔴 Bug 1: `$landlord` undefined variable in `TenancyUtilityController` — HTTP 500

**File:** `app/Http/Controllers/Api/Landlord/TenancyUtilityController.php`
**Lines:** 97, 190, 253

`store()`, `update()`, and `destroy()` all reference `$landlord->id` inside log calls, but `$landlord` is never defined in any of these methods:

```php
// store() line 97
Log::info('Utility assigned to tenancy', [
    'landlord_id' => $landlord->id,  // ← UNDEFINED
]);
```

`$landlord` was formerly a resolved method parameter in the old code. After policy-based refactoring, the parameter was removed but the log references were not cleaned up. PHP will throw `ErrorException: Undefined variable $landlord`; the outer `catch (\Exception $e)` block catches it and returns HTTP 500.

> [!CAUTION]
> **All three write operations (store, update, destroy) on `TenancyUtilityController` always return HTTP 500.** This is a P0 production defect.

**Fix:** Replace `$landlord->id` with `$request->user()->id` on lines 97, 190, and 253.

---

#### 🔴 Bug 2: `$landlord` undefined variable in `UtilityBillController` — HTTP 500

**File:** `app/Http/Controllers/Api/Landlord/UtilityBillController.php`
**Lines:** 209, 259

Same issue in `update()` and `waive()`:

```php
// update() line 209
Log::info('Utility bill updated', [
    'landlord_id' => $landlord->id,  // ← UNDEFINED
]);

// waive() line 259
Log::info('Utility bill waived', [
    'landlord_id' => $landlord->id,  // ← UNDEFINED
]);
```

> [!CAUTION]
> **`UtilityBillController::update()` and `::waive()` always return HTTP 500.**

**Fix:** Replace `$landlord->id` with `$request->user()->id` on lines 209 and 259.

---

#### ⚠️ Pre-existing issue surfaced: `PaymentPolicy` lazy-loading in update/delete

**File:** `app/Policies/PaymentPolicy.php` lines 32, 46

```php
return $payment->tenancy->unit->property->owner_id === $user->id;
```

`Landlord\PaymentController::update()` and `::destroy()` call `Payment::findOrFail($id)` with **no eager loading** before calling `authorize()`. The policy then lazy-loads `tenancy→unit→property`, triggering 3+ extra queries. If any relation in that chain is null (e.g. an orphaned payment), it throws a `TypeError`.

> [!WARNING]
> This is a pre-existing issue made more prominent by Week 2 since the policy is now exercised on every request. Add `->with(['tenancy.unit.property'])` to the `findOrFail` calls in `update()` and `destroy()`.

---

#### ⚠️ Missing authorization test coverage (H1-B through H1-J)

The plan required a cross-ownership authorization test file for each controller. Only `PropertyAuthorizationTest.php` (H1-A) was created. No Sanctum-level 403 tests exist for the remaining 9 controller groups.

The `assertForbidden` tests in `tests/Feature/Landlord/` provide partial coverage for some scenarios, but the API-layer isolation is only tested for `PropertyController`.

---

## Manual Checklist Assessment

| Item | Status |
|---|---|
| `.github/workflows/tests.yml` has `migrate:fresh` step | ✅ Done |
| `start.sh` has `queue:work` background process | ✅ Done |
| `Tenant::booted()` uses `created` hook with `updateQuietly()` | ✅ Done |
| `tenants.tenant_code` has unique DB constraint | ✅ Done |
| `payments` and `rent_bills` FKs changed from CASCADE to RESTRICT | ✅ Migration correct |
| C4 tests prove the constraint blocks deletes | ❌ Tests are tautological stubs |
| All API controllers call `$this->authorize()` | ✅ Mostly done |
| `TenancyUtilityController` write operations are functional | ❌ HTTP 500 — `$landlord` undefined |
| `UtilityBillController` update/waive are functional | ❌ HTTP 500 — `$landlord` undefined |
| Authorization tests for all H1 controllers | ❌ Only H1-A (PropertyController) tested |
| All tests pass | ❌ Cannot confirm — P0 bugs would fail integration |

---

## Priority Remediation

| Priority | Item | Fix |
|---|---|---|
| 🔴 P0 | `TenancyUtilityController::store/update/destroy` — `$landlord` undefined | `$landlord->id` → `$request->user()->id` on lines 97, 190, 253 |
| 🔴 P0 | `UtilityBillController::update/waive` — `$landlord` undefined | `$landlord->id` → `$request->user()->id` on lines 209, 259 |
| 🟠 P1 | `FinancialRecordProtectionTest` — all placeholder stubs | Rewrite with factory-based delete-blocked assertions |
| 🟡 P2 | `PaymentPolicy` lazy-loads in `update/destroy` | Add `->with(['tenancy.unit.property'])` to `findOrFail` calls |
| 🟡 P2 | H1-B through H1-J authorization tests missing | Add cross-ownership 403 test files per controller |
