# Week 3 — Performance & Quality (Agent Instructions)

> **Branch**: `refactor-production-readiness`
> **Goal**: Eliminate N+1 query patterns, consolidate duplicated business logic, add missing DB indexes, standardize API error shapes, and close remaining authorization test gaps from Week 2.
> **Estimated effort**: ~5.5 hours

---

## Agent Ground Rules

1. **One task = one commit.** Never batch tasks.
2. **Run `php artisan test --compact --filter=<relevant>` after every PHP change.**
3. **Run `vendor/bin/pint --dirty --format agent` after every PHP file edit.**
4. **Read each target file before editing.** Line numbers shift.
5. **Do not touch files unrelated to the current task.**

---

## State Carry-Over from Week 2 Review

Before starting Week 3 tasks, verify the following are resolved (they were P0/P1 from the code review). Read the files and confirm — do not re-fix if already done.

| Item | File | What to check |
|------|------|---------------|
| P0: `$landlord` undefined in `TenancyUtilityController` | `app/Http/Controllers/Api/Landlord/TenancyUtilityController.php` lines 97, 190, 253 | Should be `$request->user()->id`, not `$landlord->id` |
| P0: `$landlord` undefined in `UtilityBillController` | `app/Http/Controllers/Api/Landlord/UtilityBillController.php` lines 209, 259 | Should be `$request->user()->id`, not `$landlord->id` |
| P2: `PaymentPolicy` lazy-loads in `update/destroy` | `app/Http/Controllers/Api/Landlord/PaymentController.php` lines 228, 261 | Should be `Payment::with(['tenancy.unit.property'])->findOrFail($paymentId)` |

If any of these are not fixed, fix them first and commit before continuing:
```
git commit -m "fix(p0): resolve undefined \$landlord variable in utility controllers"
```

---

## Task Index

| ID | Task | Effort | Commit after? |
|----|------|--------|---------------|
| [W2-TEST](#w2-test-add-missing-h1-authorization-tests) | Add cross-ownership 403 tests for H1-B through H1-J | 1 hr | ✅ Yes |
| [M3](#m3-add-missing-database-indexes) | Add missing DB indexes migration | 30 min | ✅ Yes |
| [M6](#m6-standardize-error-response-shapes) | Standardize `error` → `message` key in error responses | 30 min | ✅ Yes |
| [H4](#h4-refactor-dashboard-n1-queries) | Extract `$propertyIds` once in dashboard controller | 1 hr | ✅ Yes |
| [H5](#h5-consolidate-payment-logic-into-paymentservice) | Delegate `Tenant\PaymentsController::store()` to `PaymentService` | 2 hrs | ✅ Yes |

---

## W2-TEST. Add Missing H1 Authorization Tests

**Background**: The Week 2 plan required cross-ownership 403 tests for every API controller group (H1-A through H1-J). Only `PropertyAuthorizationTest.php` (H1-A) was written. The remaining 9 controller groups have no cross-ownership test coverage.

**Pattern to follow** — every test file must prove: *landlord A cannot access landlord B's resources*.

### Step 1 — Check which test files already exist

```powershell
Get-ChildItem tests/Feature -Recurse -Filter "*Authorization*"
```

Only create files that do not already exist.

### Step 2 — Create authorization test files

Create one file per controller group. Use this command for each:

```powershell
php artisan make:test --pest Api/Landlord/UnitAuthorizationTest
php artisan make:test --pest Api/Landlord/TenantAuthorizationTest
php artisan make:test --pest Api/Landlord/RentBillAuthorizationTest
php artisan make:test --pest Api/Landlord/PaymentAuthorizationTest
php artisan make:test --pest Api/Landlord/TenancyUtilityAuthorizationTest
php artisan make:test --pest Api/Landlord/UtilityBillAuthorizationTest
php artisan make:test --pest Api/Tenant/RentBillAuthorizationTest
php artisan make:test --pest Api/Tenant/PaymentsAuthorizationTest
```

### Step 3 — Write the tests

Use this template for each file. Adapt model names and routes per controller.

**Template** (`UnitAuthorizationTest.php` as example):

```php
<?php

use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use App\Enums\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns 403 when a landlord views another landlords unit', function (): void {
    $owner = User::factory()->create(['role' => Role::Landlord]);
    $other = User::factory()->create(['role' => Role::Landlord]);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    $this->actingAs($owner, 'sanctum')
        ->getJson("/api/v1/landlord/units/{$unit->id}")
        ->assertForbidden();
});

it('returns 403 when a landlord updates another landlords unit', function (): void {
    $owner = User::factory()->create(['role' => Role::Landlord]);
    $other = User::factory()->create(['role' => Role::Landlord]);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    $this->actingAs($owner, 'sanctum')
        ->putJson("/api/v1/landlord/units/{$unit->id}", ['unit_name' => 'Hacked'])
        ->assertForbidden();
});

it('returns 403 when a landlord deletes another landlords unit', function (): void {
    $owner = User::factory()->create(['role' => Role::Landlord]);
    $other = User::factory()->create(['role' => Role::Landlord]);

    $property = Property::factory()->create(['owner_id' => $other->id]);
    $unit = Unit::factory()->create(['property_id' => $property->id]);

    $this->actingAs($owner, 'sanctum')
        ->deleteJson("/api/v1/landlord/units/{$unit->id}")
        ->assertForbidden();
});
```

### Routes to test per controller group

Before writing each test file, run `php artisan route:list --path=api/v1 --except-vendor` to confirm the exact route URIs.

| Controller | Routes to cover (cross-ownership: show, update, delete) |
|------------|----------------------------------------------------------|
| `Landlord\UnitController` | `GET /api/v1/landlord/units/{id}`, `PUT`, `DELETE` |
| `Landlord\TenantController` | `GET /api/v1/landlord/tenants/{id}` (show), `PUT` (update) |
| `Landlord\RentBillController` | `GET /api/v1/landlord/rent-bills/{id}` (show), `POST .../waive` |
| `Landlord\PaymentController` | `GET /api/v1/landlord/payments/{id}`, `PUT`, `DELETE` |
| `Landlord\TenancyUtilityController` | `GET show`, `PUT update`, `DELETE destroy` |
| `Landlord\UtilityBillController` | `GET show`, `PUT update`, `POST waive` |
| `Tenant\RentBillController` | `GET /api/v1/tenant/rent-bills/{id}` (tenant A cannot see tenant B's bills) |
| `Tenant\PaymentsController` | `GET /api/v1/tenant/payments/{id}/receipt` (cross-tenant) |

> For **Tenant** routes: the cross-ownership test is tenant A cannot see tenant B's records, not landlord cross-ownership. Use two different tenant users.

### Run tests

```powershell
php artisan test --compact --filter=Authorization
```

### Commit

```
git add tests/
git commit -m "test(auth): add cross-ownership 403 tests for H1-B through H1-J controllers"
```

---

## M3. Add Missing Database Indexes

**Background**: Four index gaps identified in the audit. These affect rent calculation queries, MTD revenue, and overdue bill lookups.

### Step 1 — Inspect current indexes before writing migration

```powershell
php artisan tinker --execute "Schema::getIndexes('payments');"
php artisan tinker --execute "Schema::getIndexes('utility_bills');"
php artisan tinker --execute "Schema::getIndexes('tenancy_utilities');"
```

Confirm the following indexes do **not** already exist before adding them.

### Step 2 — Create the migration

```powershell
php artisan make:migration add_performance_indexes_to_payments_and_utility_tables
```

Migration content:

```php
public function up(): void
{
    // payments: composite for rent sum calculations
    Schema::table('payments', function (Blueprint $table): void {
        $table->index(['tenancy_id', 'status', 'payment_type'], 'idx_payments_tenancy_status_type');
        // payments: for MTD revenue (paid_at range filter)
        $table->index('paid_at', 'idx_payments_paid_at');
    });

    // utility_bills: for overdue scope (status + due_date)
    Schema::table('utility_bills', function (Blueprint $table): void {
        $table->index(['status', 'due_date'], 'idx_utility_bills_status_due_date');
    });

    // tenancy_utilities: for active utility filter
    Schema::table('tenancy_utilities', function (Blueprint $table): void {
        $table->index(['tenancy_id', 'status'], 'idx_tenancy_utilities_tenancy_status');
    });
}

public function down(): void
{
    Schema::table('payments', function (Blueprint $table): void {
        $table->dropIndex('idx_payments_tenancy_status_type');
        $table->dropIndex('idx_payments_paid_at');
    });

    Schema::table('utility_bills', function (Blueprint $table): void {
        $table->dropIndex('idx_utility_bills_status_due_date');
    });

    Schema::table('tenancy_utilities', function (Blueprint $table): void {
        $table->dropIndex('idx_tenancy_utilities_tenancy_status');
    });
}
```

Run the migration:

```powershell
php artisan migrate
```

### Test

No application behavior changes — add a schema assertion test:

```powershell
php artisan make:test --pest PerformanceIndexesTest
```

```php
<?php

use Illuminate\Support\Facades\Schema;

it('payments table has the performance indexes', function (): void {
    $indexes = collect(Schema::getIndexes('payments'))->pluck('name');
    expect($indexes)->toContain('idx_payments_tenancy_status_type');
    expect($indexes)->toContain('idx_payments_paid_at');
});

it('utility_bills table has the status_due_date index', function (): void {
    $indexes = collect(Schema::getIndexes('utility_bills'))->pluck('name');
    expect($indexes)->toContain('idx_utility_bills_status_due_date');
});

it('tenancy_utilities table has the tenancy_status index', function (): void {
    $indexes = collect(Schema::getIndexes('tenancy_utilities'))->pluck('name');
    expect($indexes)->toContain('idx_tenancy_utilities_tenancy_status');
});
```

### Run pint + tests

```powershell
vendor/bin/pint database/migrations/ --format agent
php artisan test --compact --filter=PerformanceIndexes
```

### Commit

```
git add database/migrations/ tests/
git commit -m "perf(db): add composite indexes on payments, utility_bills, tenancy_utilities"
```

---

## M6. Standardize Error Response Shapes

**Background**: API errors use `{'error': '...'}` in some places and `{'message': '...'}` in others. Laravel's convention is `message`. Mobile clients currently handle both keys.

### Step 1 — Find all `'error'` response keys in API controllers

```powershell
Select-String -Path "app\Http\Controllers\Api\**\*.php" -Pattern "'error'" -Recurse
```

### Step 2 — Sites to change

Based on the audit, these are confirmed `'error'` keys in JSON responses (not in `Log::error` calls — those are fine):

| File | Line(s) | Current | Change to |
|------|---------|---------|-----------|
| `Api\Tenant\PaymentsController.php` | 127 | `'error' => 'No active tenancy found.'` | `'message'` |
| `Api\Tenant\PaymentsController.php` | 213, 219, 226 | `'error' => '...'` (inside DB transaction — these return `response()->json()` from inside a closure) | `'message'` |
| `Api\Tenant\PaymentsController.php` | 237 | `return response()->json(['error' => $e->getMessage()], 422)` | `'message'` |
| `Api\Tenant\PaymentsController.php` | 293–295 | `'error' => $result['error']` | `'message'` |
| `Api\Tenant\PaymentsController.php` | 317 | `'error' => 'Failed to process payment...'` | `'message'` |

> **Do not change** `Log::error(...)` calls — those are log channel calls, not response keys.
> **Do not change** array keys used for internal logic (e.g., `$result['error']` used in an `if` check on line 292 — change the response output key, not the internal array key).

### Step 3 — Edit `Api\Tenant\PaymentsController.php`

Read the file first, then make surgical replacements only at the exact lines above. The internal `$result['error']` check on line 292 (`if (isset($result['error']))`) must remain — only change `'error'` inside `response()->json([...])` calls.

### Step 4 — Run pint + tests

```powershell
vendor/bin/pint app/Http/Controllers/Api/Tenant/PaymentsController.php --format agent
php artisan test --compact --filter=Payment
```

### Commit

```
git add app/Http/Controllers/Api/Tenant/PaymentsController.php
git commit -m "fix(api): standardize error response key from 'error' to 'message' in PaymentsController"
```

---

## H4. Refactor Dashboard N+1 Queries

**Background**: `Api\Landlord\DashboardController::index()` runs the same correlated subquery `whereHas('tenancy.unit.property', fn ($q) => $q->where('owner_id', $landlord->id))` **four separate times** — for `$pendingPayments`, `$overduePayments`, `$revenueMtd`, `$recentPayments`, and `$rentStats`. Each is a full correlated subquery. Extracting `$propertyIds` and `$tenancyIds` once eliminates the redundancy.

### Current file

**File**: `app/Http/Controllers/Api/Landlord/DashboardController.php` (201 lines total — read in full before editing)

The repeated pattern appears at lines 55–56, 62–63, 70–71, 79–80, 111–112, 155–156.

### Refactor plan

**Step 1** — After `$properties` is loaded (line 36), extract IDs immediately:

```php
// Extract IDs once — used by all subsequent queries to avoid repeated correlated subqueries
$propertyIds = $properties->pluck('id');
$tenancyIds  = Tenancy::whereIn('unit_id',
    \App\Models\Unit::whereIn('property_id', $propertyIds)->pluck('id')
)->pluck('id');
```

**Step 2** — Replace every `whereHas('tenancy.unit.property', ...)` with `whereIn('tenancy_id', $tenancyIds)` or `whereIn('id', $tenancyIds)` as appropriate:

| Current (lines) | Replace with |
|----------------|--------------|
| `Payment::whereHas('tenancy.unit.property', ...)` (×4) | `Payment::whereIn('tenancy_id', $tenancyIds)` |
| `RentBill::whereHas('tenancy.unit.property', ...)` (line 155) | `RentBill::whereIn('tenancy_id', $tenancyIds)` |
| `Tenancy::whereHas('unit.property', ...)` (line 111) | `Tenancy::whereIn('id', $tenancyIds)` |

**Step 3** — The `unreadNotificationsCount` on line 152 does not use `whereHas` — leave it unchanged.

**Step 4** — Add the `Tenancy` and `Unit` imports at the top if not already present. Verify the current import list before adding.

**Step 5** — Run pint:

```powershell
vendor/bin/pint app/Http/Controllers/Api/Landlord/DashboardController.php --format agent
```

### Test

Check if a dashboard test exists:

```powershell
php artisan test --compact --filter=Dashboard
```

If no test exists, create a smoke test:

```powershell
php artisan make:test --pest Api/Landlord/DashboardTest
```

```php
<?php

use App\Models\User;
use App\Enums\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns dashboard data for a landlord', function (): void {
    $landlord = User::factory()->create(['role' => Role::Landlord]);

    $this->actingAs($landlord, 'sanctum')
        ->getJson('/api/v1/landlord/dashboard')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                'total_properties',
                'total_units',
                'occupied_units',
                'vacant_units',
                'total_tenants',
                'revenue_mtd',
                'pending_rent_bills',
                'overdue_rent_bills',
                'recent_payments',
                'expiring_leases',
                'properties',
            ],
        ]);
});

it('returns 403 for a tenant accessing the landlord dashboard', function (): void {
    $tenant = User::factory()->create(['role' => Role::Tenant]);

    $this->actingAs($tenant, 'sanctum')
        ->getJson('/api/v1/landlord/dashboard')
        ->assertForbidden();
});
```

### Run tests

```powershell
php artisan test --compact --filter=Dashboard
```

### Commit

```
git add app/Http/Controllers/Api/Landlord/DashboardController.php tests/
git commit -m "perf(api): eliminate repeated correlated subqueries in landlord dashboard"
```

---

## H5. Consolidate Payment Logic into PaymentService

**Background**: `Api\Tenant\PaymentsController::store()` contains ~190 lines of inline business logic — duplicate detection, rent bill linking, utility bill validation, status calculation, and transaction handling. `PaymentService::processPayment()` already implements the same logic. The controller must delegate to the service.

> **Important**: `PaymentService` is currently marked as `SCAFFOLD` (not wired into any route). The `processPayment()` method is the right target. `processGatewayPayment()` is for the future gateway path — do not touch it.

### Step 1 — Read both files in full

Read these files completely before making any changes:
- `app/Http/Controllers/Api/Tenant/PaymentsController.php` (335 lines)
- `app/Services/PaymentService.php` (251 lines)

### Step 2 — Identify gaps between service and controller

The service `processPayment()` (lines 62–127) handles:
- ✅ Duplicate prevention
- ✅ Utility bill processing via `UtilityService`
- ✅ Rent status calculation
- ✅ Payment create/update
- ❌ Missing: `Tenancy::lockForUpdate()` (controller line 135)
- ❌ Missing: `RentBillService::linkPaymentToBill()` + `createPaymentWithRentBill()` (controller lines 183–274)
- ❌ Missing: `reference_number` and `notes` fields in payment data (controller lines 202–203)

### Step 3 — Update `PaymentService::processPayment()`

Add the missing capabilities to the service. Read the method at lines 62–127 first, then add:

**3a. Add row-level locking**:
```php
// Inside DB::transaction(), after opening:
$lockedTenancy = Tenancy::lockForUpdate()->find($activeTenancy->id);
if (! $lockedTenancy) {
    return ['error' => 'Transaction conflict. Please try again.'];
}
```

**3b. Add `RentBillService` integration**. Add it as a constructor dependency (already nullable there):
```php
public function __construct(
    protected ?PaymentGatewayInterface $gateway = null,
    protected ?RentBillService $rentBillService = null,
    protected ?UtilityService $utilityService = null
) {}
```
This is already present — do not duplicate. Inject via `app(RentBillService::class)` inside the transaction if `$this->rentBillService` is null (scaffold-safe pattern).

**3c. Add `reference_number` and `notes` to `$paymentData`**:
```php
'reference_number' => $validated['reference_number'] ?? null,
'notes'            => $validated['notes'] ?? null,
```

**3d. Add `RentBillService::linkPaymentToBill()` call for rent payments** (mirrors controller lines 182–190):
```php
if ($validated['payment_type'] === 'rent') {
    $rentBillService = $this->rentBillService ?? app(RentBillService::class);
    $billLinkResult = $rentBillService->linkPaymentToBill(
        $activeTenancy->id,
        ! empty($validated['rent_bill_id']) ? (int) $validated['rent_bill_id'] : null,
        false
    );
    $rentBillId = $billLinkResult['rent_bill_id'];
}
```

**3e. Add `createPaymentWithRentBill()` call** (mirrors controller lines 259–274):
```php
if ($validated['payment_type'] === 'rent' && $rentBillId) {
    try {
        $rentBillService = $this->rentBillService ?? app(RentBillService::class);
        $payment = $rentBillService->createPaymentWithRentBill($paymentData, $rentBillId, $validated['amount']);
    } catch (\InvalidArgumentException $e) {
        $rentBillWarning = $e->getMessage();
        $payment = Payment::create($paymentData);
    }
} else {
    $payment = Payment::create($paymentData);
}

return ['success' => true, 'payment' => $payment, 'warning' => $rentBillWarning ?? null];
```

### Step 4 — Simplify `PaymentsController::store()`

After the service is updated, replace the entire try block (lines 131–319) with:

```php
if (! $activeTenancy) {
    return response()->json(['message' => 'No active tenancy found.'], 422);
}

$result = app(\App\Services\PaymentService::class)->processPayment($validated, $activeTenancy);

if (isset($result['error'])) {
    return response()->json(['message' => $result['error']], 422);
}

return response()->json([
    'success' => true,
    'message' => 'Payment processed successfully!',
    'data' => [
        'payment'     => $result['payment'],
        'warning'     => $result['warning'] ?? null,
    ],
], 201);
```

Remove unused imports from the controller after the refactor (`DB`, `Tenancy`, `UtilityBill`, `RentBillService`, `UtilityService` — verify each before removing).

### Step 5 — Run pint

```powershell
vendor/bin/pint app/Http/Controllers/Api/Tenant/PaymentsController.php app/Services/PaymentService.php --format agent
```

### Step 6 — Run tests

Run the full payment-related suite to catch regressions:

```powershell
php artisan test --compact --filter=Payment
```

If tests fail, compare the service output shape against what the controller tests assert and align them. Do not change the test assertions — fix the service to match them.

### Step 7 — Verify behavior parity

The refactored controller must still:
- Return 422 with `message` (not `error`) for no active tenancy
- Return 422 with `message` for duplicate payment
- Return 201 with `success`, `message`, `data.payment` on success
- Return 422 for utility bill validation failures
- Return 500 on unexpected exceptions

### Commit

```
git add app/Http/Controllers/Api/Tenant/PaymentsController.php app/Services/PaymentService.php tests/
git commit -m "refactor(payments): delegate store() logic to PaymentService, eliminate 190 lines of inline duplication"
```

---

## Final Verification

```powershell
# Full suite
php artisan test --compact

# Pint clean check
vendor/bin/pint --dirty --format agent

# Review commit log
git log --oneline -10
```

### Manual checklist

- [ ] P0 bugs (`$landlord` undefined) are confirmed fixed before Week 3 starts
- [ ] Cross-ownership 403 tests exist for all H1 controller groups
- [ ] All 4 performance indexes added and migration runs cleanly
- [ ] `'error'` key replaced with `'message'` in all `response()->json()` calls in `PaymentsController`
- [ ] Dashboard no longer runs repeated `whereHas('tenancy.unit.property', ...)` — uses `whereIn('tenancy_id', $tenancyIds)` instead
- [ ] `Tenant\PaymentsController::store()` delegates to `PaymentService::processPayment()`
- [ ] All tests pass

### Push

```powershell
git push origin refactor-production-readiness
```
