# Week 2 — Structural Safety (Agent Instructions)

> **Branch**: `refactor-production-readiness`
> **Goal**: Protect financial data integrity, eliminate inline authorization, and harden infra.
> **Estimated effort**: ~5 hours

---

## Agent Ground Rules

Same as Week 1 — these apply to every task:

1. **One task = one commit.** Never batch tasks.
2. **Run `php artisan test --compact --filter=<relevant>` after every PHP change.** Fix failures before moving on.
3. **Run `vendor/bin/pint --dirty --format agent` after every PHP file edit.**
4. **Read each target file before editing.** Line numbers shift as code evolves.
5. **Do not touch files unrelated to the current task.**
6. **Use `php artisan make:migration` / `php artisan make:test` to create new files.**

---

## Task Index

| ID | Task | Risk | Commit after? |
|----|------|------|---------------|
| [M5](#m5-add-migrationfresh-to-ci) | Add `migrate:fresh` step to CI | None | ✅ Yes |
| [M1](#m1-add-queue-worker-to-startsh) | Add `queue:work` to `start.sh` | Low | ✅ Yes |
| [H2](#h2-fix-tenant-code-race-condition) | Fix `tenant_code` race condition + add unique constraint | Low | ✅ Yes |
| [C4](#c4-change-cascade-delete-to-restrict-on-financial-fks) | Change cascade→restrict on financial FKs | **High** | ✅ Yes |
| [H1](#h1-wire-policies-into-api-controllers) | Wire policies into all API controllers | Medium | Per-controller |

> **Execute in the order listed.** C4 and H1 are the most impactful — do them last after CI and simpler tasks pass.

---

## M5. Add `migrate:fresh` to CI

**Impact**: The CI test suite uses `RefreshDatabase` but never validates that all migrations run cleanly from scratch. Silent migration ordering bugs go undetected.
**Files**: `.github/workflows/tests.yml`
**PHP changes**: None. No pint. No PHP tests needed.

### Current `tests.yml` (53 lines, full file)

The `Tests` step at line 51–52:
```yaml
      - name: Tests
        run: ./vendor/bin/pest
```

### Change

Add a `Verify fresh migration` step **before** the `Tests` step:

```yaml
      - name: Verify fresh migration
        run: php artisan migrate:fresh --force

      - name: Tests
        run: ./vendor/bin/pest
```

The full step block to insert (add between "Generate Application Key" and "Tests"):

```yaml
      - name: Verify fresh migration
        run: php artisan migrate:fresh --force
```

### Commit

```
git add .github/workflows/tests.yml
git commit -m "ci: add migrate:fresh step to verify migration order on every run"
```

---

## M1. Add Queue Worker to `start.sh`

**Impact**: `ProcessPaymentConfirmed` implements `ShouldQueue` but no queue worker runs in production. Jobs accumulate in the `jobs` table and never execute.
**File**: `start.sh`
**PHP changes**: None. No pint needed.

### Current `start.sh` state (after Week 1, 26 lines)

```sh
#!/bin/sh
...
# Start PHP-FPM in background
php-fpm &

# Start Nginx in foreground
nginx -g 'daemon off;'
```

### Change

Add the queue worker **between** the PHP-FPM start and Nginx. It must run as a background process (`&`):

```sh
# Start PHP-FPM in background
php-fpm &

# Start queue worker in background
# --sleep=3: wait 3s between polls when no jobs
# --tries=3: retry failed jobs up to 3 times
# --max-time=3600: restart worker hourly (prevents memory leaks)
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &

# Start Nginx in foreground
nginx -g 'daemon off;'
```

> **Note**: A single queue worker in the same container is acceptable for now. For high-volume production, a dedicated Render Background Worker service is the correct long-term approach (tracked in the main plan).

### Commit

```
git add start.sh
git commit -m "fix(infra): add queue:work background process to start.sh"
```

---

## H2. Fix Tenant Code Race Condition

**Impact**: Concurrent tenant creation can produce duplicate `tenant_code` values. The `booted()` hook reads `max('id')` before the row is inserted — two simultaneous requests get the same value.

### Current broken logic in `app/Models/Tenant.php:59-66`

```php
protected static function booted()
{
    static::creating(function ($tenant) {
        if (! $tenant->tenant_code) {
            $lastId = Tenant::withTrashed()->max('id') + 1;
            $tenant->tenant_code = 'TEN-'.str_pad($lastId, 5, '0', STR_PAD_LEFT);
        }
    });
}
```

### Two-part fix

#### Part A — Move code generation to `created` hook (uses real ID)

Replace the `creating` hook with a `created` hook so the code is generated from the actual auto-incremented ID after insert:

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

> **Why `updateQuietly()`**: avoids firing model events again (no infinite loop, no second `created` event).

#### Part B — Add unique DB constraint via migration

```powershell
php artisan make:migration add_unique_constraint_to_tenant_code --table=tenants
```

Migration content:

```php
public function up(): void
{
    Schema::table('tenants', function (Blueprint $table): void {
        $table->unique('tenant_code', 'uq_tenants_tenant_code');
    });
}

public function down(): void
{
    Schema::table('tenants', function (Blueprint $table): void {
        $table->dropUnique('uq_tenants_tenant_code');
    });
}
```

Run the migration:

```powershell
php artisan migrate
```

### Run pint

```powershell
vendor/bin/pint app/Models/Tenant.php --format agent
```

### Tests to update

Search for existing tenant creation tests:

```powershell
php artisan test --compact --filter=Tenant
```

If any test asserts that `tenant_code` is set before creation (e.g., passing it into `creating`), update it to check after the model is persisted. The code will now be `TEN-00001` based on the actual ID, not `max(id)+1`.

Add a new test:

```powershell
php artisan make:test --pest TenantCodeGenerationTest
```

```php
<?php

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('generates a unique tenant_code based on the actual row id after insert', function (): void {
    $tenant = Tenant::factory()->create(['tenant_code' => null]);

    expect($tenant->fresh()->tenant_code)
        ->toMatch('/^TEN-\d{5}$/')
        ->toBe('TEN-'.str_pad($tenant->id, 5, '0', STR_PAD_LEFT));
});

it('does not overwrite an explicitly provided tenant_code', function (): void {
    $tenant = Tenant::factory()->create(['tenant_code' => 'TEN-CUSTOM']);

    expect($tenant->fresh()->tenant_code)->toBe('TEN-CUSTOM');
});

it('cannot create two tenants with the same tenant_code', function (): void {
    Tenant::factory()->create(['tenant_code' => 'TEN-00001']);

    expect(fn () => Tenant::factory()->create(['tenant_code' => 'TEN-00001']))
        ->toThrow(\Illuminate\Database\QueryException::class);
});
```

### Run tests

```powershell
php artisan test --compact --filter=TenantCode
```

### Commit

```
git add app/Models/Tenant.php database/migrations/ tests/
git commit -m "fix(data): generate tenant_code from actual row id, add unique DB constraint"
```

---

## C4. Change Cascade→Restrict on Financial FKs

**Impact**: Deleting a tenant cascades through tenancies → payments AND rent_bills, permanently destroying financial records. This is the highest-risk data integrity issue.

> ⚠️ **Staging-first rule**: If a staging environment exists, run this migration there first and verify no existing data is affected before running on production.

### Confirmed cascade chain (from migration audit)

| Migration | Table | FK | Current | Target |
|-----------|-------|----|---------|--------|
| `2026_02_03_154927_create_payments_table.php:16` | `payments` | `tenant_id → tenants` | `cascadeOnDelete` | `restrictOnDelete` |
| `2026_02_03_154927_create_payments_table.php:17` | `payments` | `tenancy_id → tenancies` | `cascadeOnDelete` | `restrictOnDelete` |
| `2026_03_21_000001_create_rent_bills_table.php:15` | `rent_bills` | `tenancy_id → tenancies` | `cascadeOnDelete` | `restrictOnDelete` |

> **Do not touch** `tenancy_identifications`, `messages`, `notifications` cascade FKs — those are appropriate cascade targets (personal data, not financial records).

### Create the migration

```powershell
php artisan make:migration restrict_financial_record_deletion_on_tenants_and_tenancies
```

Migration content:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Change cascade-on-delete to restrict-on-delete for financial tables.
     * This prevents accidental destruction of payment and rent bill records
     * when a tenant or tenancy is deleted.
     *
     * To delete a tenant/tenancy, financial records must be archived first.
     */
    public function up(): void
    {
        // payments.tenant_id
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->restrictOnDelete();
        });

        // payments.tenancy_id
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')
                ->references('id')
                ->on('tenancies')
                ->restrictOnDelete();
        });

        // rent_bills.tenancy_id
        Schema::table('rent_bills', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')
                ->references('id')
                ->on('tenancies')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        // Restore cascade behaviour
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenant_id']);
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')->references('id')->on('tenancies')->cascadeOnDelete();
        });

        Schema::table('rent_bills', function (Blueprint $table): void {
            $table->dropForeign(['tenancy_id']);
            $table->foreign('tenancy_id')->references('id')->on('tenancies')->cascadeOnDelete();
        });
    }
};
```

Run the migration:

```powershell
php artisan migrate
```

### Tests to write

```powershell
php artisan make:test --pest FinancialRecordProtectionTest
```

```php
<?php

use App\Models\Payment;
use App\Models\RentBill;
use App\Models\Tenant;
use App\Models\Tenancy;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('prevents deleting a tenant that has payment records', function (): void {
    $tenant = Tenant::factory()->has(
        Tenancy::factory()->has(Payment::factory())
    )->create();

    expect(fn () => $tenant->delete())
        ->toThrow(\Illuminate\Database\QueryException::class);
});

it('prevents deleting a tenancy that has rent bills', function (): void {
    $tenancy = Tenancy::factory()->has(RentBill::factory())->create();

    expect(fn () => $tenancy->delete())
        ->toThrow(\Illuminate\Database\QueryException::class);
});

it('allows deleting a tenant with no financial records', function (): void {
    $tenant = Tenant::factory()->create();

    expect(fn () => $tenant->delete())->not->toThrow(\Illuminate\Database\QueryException::class);
});
```

> **Adjust factory calls** to match existing factory states. Read the relevant factories first.

### Run tests

```powershell
php artisan test --compact --filter=FinancialRecord
```

### Commit

```
git add database/migrations/ tests/
git commit -m "fix(data): change payments and rent_bills FKs from cascade to restrict on delete"
```

---

## H1. Wire Policies into API Controllers

**Impact**: All 16 API controllers perform authorization inline using `where('owner_id', ...)` query scoping instead of `$this->authorize()`. Policies exist and are correct — they just aren't used in the API layer. Authorization bugs fixed in a policy currently only protect Web users, not mobile.

> **Important distinction**: Policies handle *can this user do X?* — they do **not** replace query scoping. Both are needed: the `authorize()` call gates the action, and the `where('owner_id', ...)` / `whereHas(...)` scope filters the results.

### What changes in each controller

For **show/update/destroy** (single-model actions):
1. Load the model using Route Model Binding or `findOrFail()` without the owner scope.
2. Call `$this->authorize('view'|'update'|'delete', $model)` — the policy returns 403 automatically.
3. Remove the inline `if ($model->owner_id !== ...)` check.

For **index** (listing actions):
1. Keep the `where('owner_id', ...)` / `whereHas(...)` scope — this filters results.
2. Add `$this->authorize('viewAny', ModelClass::class)` at the top — this gates access to the list.

For **store** (create actions):
1. Add `$this->authorize('create', ModelClass::class)`.

### Controller-by-controller instructions

Work through each controller in the order listed. Commit after every controller.

---

#### H1-A. `Api\Landlord\PropertyController`

**Policy**: `PropertyPolicy` — `viewAny`, `view`, `create`, `update`, `delete`

**Add import** at top:
```php
use App\Models\Property;
// already present — add:
use App\Policies\PropertyPolicy; // NOT needed — Laravel resolves automatically
```

**`index()`**: Add as first line of method:
```php
$this->authorize('viewAny', Property::class);
```
Keep existing `where('owner_id', $landlord->id)` scope — it still filters results.

**`show()`**: Currently uses `Property::where('owner_id', ...)->findOrFail($id)`. Change to:
```php
$property = Property::with([...])->findOrFail($propertyId);
$this->authorize('view', $property);
```

**`store()`**: Add as first line:
```php
$this->authorize('create', Property::class);
```

**`update()`**: Currently uses `Property::where('owner_id', ...)->findOrFail($id)`. Change to:
```php
$property = Property::findOrFail($propertyId);
$this->authorize('update', $property);
```

**`destroy()`**: Same pattern as update:
```php
$property = Property::findOrFail($propertyId);
$this->authorize('delete', $property);
```

**Test**:
```powershell
php artisan make:test --pest Api/Landlord/PropertyAuthorizationTest
```
Minimum test coverage:
```php
it('returns 403 when a landlord tries to view another landlords property', function (): void {
    $owner = User::factory()->landlord()->create();
    $other = User::factory()->landlord()->create();
    $property = Property::factory()->create(['owner_id' => $other->id]);

    $this->actingAs($owner, 'sanctum')
        ->getJson("/api/v1/landlord/properties/{$property->id}")
        ->assertForbidden();
});
```
Write similar tests for update and delete.

**Run pint + tests**:
```powershell
vendor/bin/pint app/Http/Controllers/Api/Landlord/PropertyController.php --format agent
php artisan test --compact --filter=PropertyAuthorization
```

**Commit**:
```
git commit -m "fix(auth): wire PropertyPolicy into Api\Landlord\PropertyController"
```

---

#### H1-B. `Api\Landlord\UnitController`

**Policy**: `UnitPolicy` — `viewAny`, `view`, `create`, `update`, `delete`

**`index()`**: Add:
```php
$this->authorize('viewAny', Unit::class);
```
Keep existing `whereHas('property', fn ($q) => $q->where('owner_id', ...))` scope.

**`show()`**: Change from `whereHas(...)->findOrFail()` to:
```php
$unit = Unit::with([...])->findOrFail($unitId);
$this->authorize('view', $unit);
```

**`store()`**: Add:
```php
$this->authorize('create', Unit::class);
```
The property ownership check (`Property::where('owner_id', ...)->findOrFail(...)`) can remain — it's a domain check, not just an authorization check.

**`update()`** and **`destroy()`**: Change from `whereHas(...)->findOrFail()` to find then authorize:
```php
$unit = Unit::findOrFail($unitId);
$this->authorize('update', $unit); // or 'delete'
```

**Commit after tests pass**:
```
git commit -m "fix(auth): wire UnitPolicy into Api\Landlord\UnitController"
```

---

#### H1-C. `Api\Landlord\TenantController`

**Policy**: `TenantPolicy` — `viewAny`, `view`, `create`, `update`, `delete`

**`index()`**: Add:
```php
$this->authorize('viewAny', Tenant::class);
```
Keep existing `Property::where('owner_id', ...)` scoping — it still filters results.

**`store()`**: Add:
```php
$this->authorize('create', Tenant::class);
```

**`show()`**: The current inline check:
```php
$hasAccess = $tenant->tenancies()->whereHas('unit.property', ...)->exists();
if (! $hasAccess) { return 403; }
```
Replace with:
```php
$this->authorize('view', $tenant);
```

**`update()`**: Currently missing an authorization check entirely. Add:
```php
$tenant = $this->findTenantByIdentifier($identifier);
$this->authorize('update', $tenant);
```

**`destroy()`**: Change from `whereHas(...)->findOrFail()` to:
```php
$tenancy = Tenancy::findOrFail($tenancyId);
$this->authorize('delete', $tenancy); // TenancyPolicy::delete
```

**Commit after tests pass**:
```
git commit -m "fix(auth): wire TenantPolicy into Api\Landlord\TenantController"
```

---

#### H1-D. `Api\Landlord\RentBillController`

**Policy**: `RentBillPolicy` — `viewAny`, `view`, `waive`

**`index()`, `overdue()`, `pending()`**: Add to each:
```php
$this->authorize('viewAny', RentBill::class);
```
Keep `whereHas('tenancy.unit.property', ...)` scope.

**`show()`**: Change from `whereHas(...)->findOrFail($id)` to:
```php
$rentBill = RentBill::with([...])->findOrFail($id);
$this->authorize('view', $rentBill);
```

**`waive()`**: Change from `whereHas(...)->findOrFail($id)` to:
```php
$rentBill = RentBill::findOrFail($id);
$this->authorize('waive', $rentBill);
```

**Commit after tests pass**:
```
git commit -m "fix(auth): wire RentBillPolicy into Api\Landlord\RentBillController"
```

---

#### H1-E. `Api\Landlord\PaymentController`

**Policy**: `PaymentPolicy` — `viewAny`, `view`, `create`, `update`, `delete`

**`index()`**: Add:
```php
$this->authorize('viewAny', Payment::class);
```

For `show()`, `store()`, `update()`, `destroy()`: read the full file first, then apply the find-then-authorize pattern for each single-model action.

**Commit after tests pass**:
```
git commit -m "fix(auth): wire PaymentPolicy into Api\Landlord\PaymentController"
```

---

#### H1-F. `Api\Landlord\TenancyUtilityController`

**Policy**: `TenancyUtilityPolicy` — `viewAny`, `view`, `create`, `update`, `delete`

Read the full file before editing. Apply find-then-authorize for each method. The `store()` method receives a `$tenancy` — use `TenancyPolicy::update` to gate adding utilities to a tenancy:
```php
$this->authorize('update', $tenancy); // landlord owns this tenancy
$this->authorize('create', TenancyUtility::class); // landlord role can create
```

**Commit after tests pass**:
```
git commit -m "fix(auth): wire TenancyUtilityPolicy into Api\Landlord\TenancyUtilityController"
```

---

#### H1-G. `Api\Landlord\UtilityBillController`

**Policy**: `UtilityBillPolicy` — `viewAny`, `view`, `waive`

Read the full file. The `waive()` method already has an inline check:
```php
$property = $utilityBill->tenancyUtility?->tenancy?->unit?->property;
if (! $property || $property->owner_id !== $landlord->id) { return 403; }
```
Replace with:
```php
$this->authorize('waive', $utilityBill);
```

**Commit after tests pass**:
```
git commit -m "fix(auth): wire UtilityBillPolicy into Api\Landlord\UtilityBillController"
```

---

#### H1-H. `Api\Tenant\RentBillController`

**Policy**: `RentBillPolicy` — `viewAny`, `view`

**`index()` and `current()`**: Add:
```php
$this->authorize('viewAny', RentBill::class);
```

**`show()`**: Currently scoped with `where('tenancy_id', $activeTenancy->id)`. Change to find-then-authorize:
```php
$rentBill = RentBill::with([...])->findOrFail($id);
$this->authorize('view', $rentBill); // RentBillPolicy checks tenant_id
```

**Commit after tests pass**:
```
git commit -m "fix(auth): wire RentBillPolicy into Api\Tenant\RentBillController"
```

---

#### H1-I. `Api\Tenant\PaymentsController`

**Policy**: `PaymentPolicy` — `viewAny`, `view`, `create`

**`index()`**: Add:
```php
$this->authorize('viewAny', Payment::class);
```

**`store()`**: Add:
```php
$this->authorize('create', Payment::class);
```

**`show()` / receipt endpoints**: Add:
```php
$this->authorize('view', $payment);
```

**Commit after tests pass**:
```
git commit -m "fix(auth): wire PaymentPolicy into Api\Tenant\PaymentsController"
```

---

#### H1-J. `Api\Tenant\UtilitiesController` and `Api\UserController`

- **`UtilitiesController`**: Read the file; add `$this->authorize('viewAny', TenancyUtility::class)` to listing methods.
- **`UserController`**: Use `UserPolicy`. Read the file first — it currently uses inline `if ($user->role !== Role::Admin)` checks. Replace with `$this->authorize('viewAny', User::class)` etc.

**Commit after tests pass**:
```
git commit -m "fix(auth): wire policies into Api\Tenant\UtilitiesController and Api\UserController"
```

---

### Final verification for H1

After all controllers are done:

```powershell
# Check that no API controller still has raw owner_id comparisons in response logic
# (query scoping for filtering is fine — inline 403 returns are not)
php artisan test --compact
vendor/bin/pint --dirty --format agent
```

Confirm the following pattern no longer appears as an authorization check in any API controller:
```php
if ($model->owner_id !== auth()->id()) {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

---

## Final Verification (run after all Week 2 tasks)

```powershell
# Full suite
php artisan test --compact

# Pint check
vendor/bin/pint --dirty --format agent

# Confirm all 6 tasks committed
git log --oneline -10
```

### Manual checklist

- [ ] `.github/workflows/tests.yml` contains `migrate:fresh` step before tests
- [ ] `start.sh` contains `queue:work` background process
- [ ] `Tenant::booted()` uses `created` hook with `updateQuietly()`
- [ ] `tenants.tenant_code` has a unique DB constraint
- [ ] `payments` and `rent_bills` FK constraints are `RESTRICT` not `CASCADE`
- [ ] All API controllers call `$this->authorize()` — no inline 403 returns
- [ ] All tests pass

### Push

```powershell
git push origin refactor-production-readiness
```
