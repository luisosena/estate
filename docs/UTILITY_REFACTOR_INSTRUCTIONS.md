# Utility System Refactor — AI Implementation Guide

## Context & Project Overview

This document provides complete instructions for refactoring the utility billing system in the **Estate Practice** property management system. The project is a **Laravel application using MySQL**.

You must read and follow every section in order. Do not skip steps, do not assume, and do not deviate from the schema conventions already established in this codebase.

---

## Current State — What Exists Today

### The `utilities` table (underdeveloped)

The current `utilities` table tracks utility *connections* (type, provider, meter number, status) but stores **no billing amounts and no payment history**. It is a flat, enum-locked table:

```
utilities
├── id (BIGINT, PK)
├── tenancy_id (FK → tenancies.id)
├── type (ENUM: 'water','electricity','gas','internet','other')
├── provider (VARCHAR, nullable)
├── account_number (VARCHAR, nullable)
├── meter_number (VARCHAR, nullable)
├── status (ENUM: 'active','disconnected','pending')
├── created_at
└── updated_at
```

**Problems with the current design:**
- The ENUM type is hardcoded — adding new utility types (security, janitor, garbage, etc.) requires a schema migration every time.
- There is no concept of a billing amount or billing cycle.
- There is no way to track monthly utility charges or whether they have been paid.
- The `payments` table handles utility payments with `type = 'utility'` but has no foreign key back to a specific utility, making reconciliation impossible.

### The `payments` table (current structure)

```
payments
├── id (BIGINT, PK)
├── tenancy_id (FK → tenancies.id)
├── tenant_id (FK → tenants.id)
├── amount (DECIMAL 12,2)
├── type (ENUM: 'rent','deposit','utility','penalty','other')
├── method (ENUM: 'cash','bank_transfer','mobile_money','card','other')
├── status (ENUM: 'pending','completed','failed','refunded')
├── payment_date (DATE)
├── due_date (DATE)
├── reference_number (VARCHAR, nullable)
├── notes (TEXT, nullable)
├── created_at
└── updated_at
```

The `payments` table is **well-structured and should not be modified**. Utility bill payments will continue to flow through this table. The refactor adds a linkage between a payment record and a specific utility bill.

### Existing relationships the refactor must preserve

```
tenancies  →  HasMany  →  utilities   (current, will be replaced by utility_types + tenancy_utilities)
tenancies  →  HasMany  →  payments    (keep as-is)
tenants    →  HasMany  →  payments    (keep as-is)
```

---

## Target State — What You Are Building

You are implementing the **Utility Join Table** pattern. This replaces the rigid ENUM-based `utilities` table with a three-table system:

```
utility_types          (catalogue of utility categories — admin managed)
       ↓  1:∞
tenancy_utilities      (which utilities apply to a specific tenancy, with fixed amounts)
       ↓  1:∞
utility_bills          (monthly charge records — one per utility per billing period)
       ↓  linked via utility_bill_id on payments
payments               (existing table — extended with nullable utility_bill_id FK)
```

---

## Step 1 — Create the `utility_types` Table

### Migration

Create file: `database/migrations/2026_03_20_000001_create_utility_types_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utility_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);               // e.g. 'Water', 'Electricity', 'Security'
            $table->string('unit', 50)->nullable();    // e.g. 'cubic metres', 'kWh', 'flat rate'
            $table->text('description')->nullable();   // optional detail for landlord UI
            $table->boolean('is_metered')->default(false); // true = usage-based billing
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utility_types');
    }
};
```

### Seeder

Create file: `database/seeders/UtilityTypeSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UtilityTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Water',       'unit' => 'cubic metres', 'is_metered' => true,  'description' => 'Water consumption billed by meter reading'],
            ['name' => 'Electricity', 'unit' => 'kWh',          'is_metered' => true,  'description' => 'Electricity consumption billed by meter reading'],
            ['name' => 'Gas',         'unit' => 'cubic metres', 'is_metered' => true,  'description' => 'Gas consumption billed by meter reading'],
            ['name' => 'Internet',    'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Fixed monthly internet subscription'],
            ['name' => 'Security',    'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly security/guard service fee'],
            ['name' => 'Janitor',     'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly cleaning and maintenance fee'],
            ['name' => 'Garbage',     'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly refuse collection fee'],
            ['name' => 'Parking',     'unit' => 'flat rate',    'is_metered' => false, 'description' => 'Monthly parking fee'],
        ];

        foreach ($types as $type) {
            DB::table('utility_types')->insertOrIgnore(array_merge($type, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
```

Register the seeder in `database/seeders/DatabaseSeeder.php` by calling `$this->call(UtilityTypeSeeder::class);`.

### Eloquent Model

Create file: `app/Models/UtilityType.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UtilityType extends Model
{
    protected $fillable = [
        'name',
        'unit',
        'description',
        'is_metered',
        'is_active',
    ];

    protected $casts = [
        'is_metered' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function tenancyUtilities(): HasMany
    {
        return $this->hasMany(TenancyUtility::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

---

## Step 2 — Create the `tenancy_utilities` Table

This is the pivot table that links a tenancy to the utility types that apply to it, along with the agreed billing amount.

### Migration

Create file: `database/migrations/2026_03_20_000002_create_tenancy_utilities_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenancy_utilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenancy_id')
                  ->constrained('tenancies')
                  ->cascadeOnDelete();
            $table->foreignId('utility_type_id')
                  ->constrained('utility_types')
                  ->restrictOnDelete();
            $table->decimal('amount', 12, 2);                             // agreed fixed amount (for flat-rate utilities)
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'annual'])->default('monthly');
            $table->string('provider', 255)->nullable();                  // migrated from old utilities.provider
            $table->string('account_number', 100)->nullable();            // migrated from old utilities.account_number
            $table->string('meter_number', 100)->nullable();              // migrated from old utilities.meter_number
            $table->enum('status', ['active', 'suspended', 'disconnected'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            // A tenancy cannot have the same utility type assigned twice
            $table->unique(['tenancy_id', 'utility_type_id'], 'uq_tenancy_utility');

            $table->index('tenancy_id');
            $table->index('utility_type_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenancy_utilities');
    }
};
```

### Eloquent Model

Create file: `app/Models/TenancyUtility.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TenancyUtility extends Model
{
    protected $fillable = [
        'tenancy_id',
        'utility_type_id',
        'amount',
        'billing_cycle',
        'provider',
        'account_number',
        'meter_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function tenancy(): BelongsTo
    {
        return $this->belongsTo(Tenancy::class);
    }

    public function utilityType(): BelongsTo
    {
        return $this->belongsTo(UtilityType::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(UtilityBill::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```

---

## Step 3 — Create the `utility_bills` Table

This table stores the individual monthly charge records. One row per utility per billing period.

### Migration

Create file: `database/migrations/2026_03_20_000003_create_utility_bills_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utility_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenancy_utility_id')
                  ->constrained('tenancy_utilities')
                  ->cascadeOnDelete();
            $table->date('billing_month');                        // store as first day of the month, e.g. 2026-03-01
            $table->decimal('units_consumed', 10, 3)->nullable(); // null for flat-rate utilities
            $table->decimal('amount_due', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('due_date');
            $table->enum('status', ['pending', 'paid', 'partial', 'overdue', 'waived'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            // One bill per utility per billing month
            $table->unique(['tenancy_utility_id', 'billing_month'], 'uq_utility_bill_month');

            $table->index('tenancy_utility_id');
            $table->index('billing_month');
            $table->index('status');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utility_bills');
    }
};
```

### Eloquent Model

Create file: `app/Models/UtilityBill.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UtilityBill extends Model
{
    protected $fillable = [
        'tenancy_utility_id',
        'billing_month',
        'units_consumed',
        'amount_due',
        'amount_paid',
        'due_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'billing_month'   => 'date',
        'due_date'        => 'date',
        'amount_due'      => 'decimal:2',
        'amount_paid'     => 'decimal:2',
        'units_consumed'  => 'decimal:3',
    ];

    public function tenancyUtility(): BelongsTo
    {
        return $this->belongsTo(TenancyUtility::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getOutstandingAmountAttribute(): float
    {
        return max(0, $this->amount_due - $this->amount_paid);
    }

    public function markPaid(float $amount): void
    {
        $this->amount_paid += $amount;
        if ($this->amount_paid >= $this->amount_due) {
            $this->status = 'paid';
        } elseif ($this->amount_paid > 0) {
            $this->status = 'partial';
        }
        $this->save();
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue')
                     ->orWhere(fn($q) => $q->where('status', 'pending')->where('due_date', '<', now()));
    }
}
```

---

## Step 4 — Extend the `payments` Table

Add a nullable foreign key to `utility_bills` so that when a payment of `type = 'utility'` is recorded, it can be traced back to the exact bill it covers.

### Migration

Create file: `database/migrations/2026_03_20_000004_add_utility_bill_id_to_payments_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('utility_bill_id')
                  ->nullable()
                  ->after('tenancy_id')
                  ->constrained('utility_bills')
                  ->nullOnDelete();

            $table->index('utility_bill_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['utility_bill_id']);
            $table->dropColumn('utility_bill_id');
        });
    }
};
```

---

## Step 5 — Update Existing Models

### `Tenancy` model

Add the new relationships to `app/Models/Tenancy.php`. Keep all existing relationships and only add the new ones:

```php
// Add these new relationships — do not remove existing ones

use App\Models\TenancyUtility;

public function tenancyUtilities(): HasMany
{
    return $this->hasMany(TenancyUtility::class);
}

public function activeUtilities(): HasMany
{
    return $this->hasMany(TenancyUtility::class)->where('status', 'active');
}
```

> **Note:** The existing `utilities()` relationship on `Tenancy` pointed to the old `utilities` table. Once migration is complete (Step 7), rename or remove that relationship so it doesn't conflict. Do not remove it until data migration is done.

### `Payment` model

Add the new relationship to `app/Models/Payment.php`:

```php
use App\Models\UtilityBill;

public function utilityBill(): BelongsTo
{
    return $this->belongsTo(UtilityBill::class);
}
```

---

## Step 6 — Data Migration from Old `utilities` Table

After running the new migrations, migrate existing records from `utilities` into `tenancy_utilities`. This script maps old ENUM values to the new `utility_types` records seeded in Step 1.

Create file: `database/migrations/2026_03_20_000005_migrate_utilities_data.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Map old ENUM values to new utility_type names (must match seeder)
        $typeMap = [
            'water'       => 'Water',
            'electricity' => 'Electricity',
            'gas'         => 'Gas',
            'internet'    => 'Internet',
            'other'       => null, // handled below — will skip or map manually
        ];

        $statusMap = [
            'active'       => 'active',
            'disconnected' => 'disconnected',
            'pending'      => 'active', // treat pending connections as active
        ];

        $oldUtilities = DB::table('utilities')->get();

        foreach ($oldUtilities as $old) {
            $typeName = $typeMap[$old->type] ?? null;

            if (!$typeName) {
                // Log unmapped 'other' type for manual review — do not silently discard
                \Log::warning("Utility ID {$old->id} has type 'other' and was skipped in data migration. Review manually.");
                continue;
            }

            $utilityType = DB::table('utility_types')->where('name', $typeName)->first();

            if (!$utilityType) {
                \Log::error("UtilityType '{$typeName}' not found. Run UtilityTypeSeeder first.");
                continue;
            }

            // Avoid duplicates if migration is re-run
            $exists = DB::table('tenancy_utilities')
                ->where('tenancy_id', $old->tenancy_id)
                ->where('utility_type_id', $utilityType->id)
                ->exists();

            if (!$exists) {
                DB::table('tenancy_utilities')->insert([
                    'tenancy_id'      => $old->tenancy_id,
                    'utility_type_id' => $utilityType->id,
                    'amount'          => 0.00,    // no amounts were stored previously — landlord must update
                    'billing_cycle'   => 'monthly',
                    'provider'        => $old->provider,
                    'account_number'  => $old->account_number,
                    'meter_number'    => $old->meter_number,
                    'status'          => $statusMap[$old->status] ?? 'active',
                    'notes'           => 'Migrated from legacy utilities table.',
                    'created_at'      => $old->created_at,
                    'updated_at'      => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Rollback: remove only migrated records (identified by notes field)
        DB::table('tenancy_utilities')
            ->where('notes', 'Migrated from legacy utilities table.')
            ->delete();
    }
};
```

> **Important:** After this migration, all migrated `tenancy_utilities` records will have `amount = 0.00` because the old table stored no billing amounts. The landlord must go into the UI and set the correct monthly amount for each utility before bills can be generated.

---

## Step 7 — Drop the Old `utilities` Table

Only run this migration **after** confirming the data migration in Step 6 was successful and the old data is no longer needed.

Create file: `database/migrations/2026_03_20_000006_drop_old_utilities_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('utilities');
    }

    public function down(): void
    {
        // Recreate the old table for rollback safety
        Schema::create('utilities', function ($table) {
            $table->id();
            $table->foreignId('tenancy_id')->constrained('tenancies')->cascadeOnDelete();
            $table->enum('type', ['water', 'electricity', 'gas', 'internet', 'other']);
            $table->string('provider', 255)->nullable();
            $table->string('account_number', 100)->nullable();
            $table->string('meter_number', 100)->nullable();
            $table->enum('status', ['active', 'disconnected', 'pending'])->default('active');
            $table->timestamps();
        });
    }
};
```

After dropping the old table, remove the old `utilities()` relationship from the `Tenancy` model and update the ERD in `DATABASE_SCHEMA.md`.

---

## Step 8 — Run Migrations in Order

```bash
php artisan migrate --step

# Then seed the utility types
php artisan db:seed --class=UtilityTypeSeeder
```

Run migrations one at a time using `--step` so you can verify each before proceeding to the next.

---

## Relationships Summary After Refactor

```
users           →  HasMany  →  properties          (unchanged)
properties      →  HasMany  →  units               (unchanged)
units           →  HasMany  →  tenancies            (unchanged)
tenancies       →  HasMany  →  payments             (unchanged)
tenancies       →  HasMany  →  tenancy_utilities    (NEW — replaces utilities)
utility_types   →  HasMany  →  tenancy_utilities    (NEW)
tenancy_utilities →  HasMany  →  utility_bills      (NEW)
utility_bills   →  HasMany  →  payments             (NEW — via utility_bill_id)
```

---

## Key Queries to Implement in the Application

### Get all utilities for a tenancy with their types

```php
$tenancy->tenancyUtilities()
    ->with('utilityType')
    ->active()
    ->get();
```

### Get all unpaid utility bills for a tenant

```php
UtilityBill::whereHas('tenancyUtility', function ($q) use ($tenantId) {
        $q->whereHas('tenancy', fn($q) => $q->where('tenant_id', $tenantId));
    })
    ->whereIn('status', ['pending', 'partial', 'overdue'])
    ->with(['tenancyUtility.utilityType'])
    ->orderBy('due_date')
    ->get();
```

### Calculate total monthly charges for a tenancy (rent + utilities)

```php
$tenancy->load('activeUtilities');

$rentAmount       = $tenancy->rent_amount;
$utilitiesTotal   = $tenancy->activeUtilities
    ->where('billing_cycle', 'monthly')
    ->sum('amount');

$totalMonthly = $rentAmount + $utilitiesTotal;
```

### Record a payment against a utility bill

```php
DB::transaction(function () use ($tenancy, $utilityBill, $amount, $method, $reference) {
    // 1. Create payment record
    $payment = Payment::create([
        'tenancy_id'      => $tenancy->id,
        'tenant_id'       => $tenancy->tenant_id,
        'utility_bill_id' => $utilityBill->id,
        'amount'          => $amount,
        'type'            => 'utility',
        'method'          => $method,
        'status'          => 'completed',
        'payment_date'    => today(),
        'due_date'        => $utilityBill->due_date,
        'reference_number'=> $reference,
    ]);

    // 2. Update the bill's paid amount and status
    $utilityBill->markPaid($amount);

    return $payment;
});
```

---

## Validation Rules (for controllers/form requests)

### Assigning a utility to a tenancy

```php
[
    'tenancy_id'      => 'required|exists:tenancies,id',
    'utility_type_id' => 'required|exists:utility_types,id',
    'amount'          => 'required|numeric|min:0',
    'billing_cycle'   => 'required|in:monthly,quarterly,annual',
    'provider'        => 'nullable|string|max:255',
    'account_number'  => 'nullable|string|max:100',
    'meter_number'    => 'nullable|string|max:100',
    'status'          => 'required|in:active,suspended,disconnected',
]
```

### Creating a utility bill

```php
[
    'tenancy_utility_id' => 'required|exists:tenancy_utilities,id',
    'billing_month'      => 'required|date_format:Y-m-d',
    'units_consumed'     => 'nullable|numeric|min:0',
    'amount_due'         => 'required|numeric|min:0',
    'due_date'           => 'required|date|after_or_equal:billing_month',
]
```

---

## Final Checklist

Before considering the refactor complete, verify all of the following:

- [ ] `utility_types` table exists and is seeded with default utility categories
- [ ] `tenancy_utilities` table exists with unique constraint on `(tenancy_id, utility_type_id)`
- [ ] `utility_bills` table exists with unique constraint on `(tenancy_utility_id, billing_month)`
- [ ] `payments.utility_bill_id` column added as nullable FK
- [ ] `UtilityType`, `TenancyUtility`, `UtilityBill` models created with correct relationships
- [ ] `Tenancy` model updated with `tenancyUtilities()` and `activeUtilities()` relationships
- [ ] `Payment` model updated with `utilityBill()` relationship
- [ ] Old `utilities` data migrated to `tenancy_utilities`
- [ ] Old `utilities` table dropped
- [ ] Old `utilities()` relationship removed from `Tenancy` model
- [ ] `UtilityTypeSeeder` registered in `DatabaseSeeder`
- [ ] All migrations run cleanly with `php artisan migrate:status` showing no pending migrations
- [ ] Landlord UI updated to allow assigning utilities to tenancies and setting amounts
- [ ] Payment flow updated so utility payments link to a specific `utility_bill_id`
