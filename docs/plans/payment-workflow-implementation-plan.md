# Payment Processing Workflow Implementation Plan

## Overview

This document outlines the implementation plan for the Tenant Portal Payment Processing Workflow. The workflow allows tenants to:
1. View pending/unpaid rent amounts (calculated from monthly rent minus payments made)
2. Make a new payment
3. Fill out a comprehensive payment form with validation
4. Confirm payment details before submission
5. Submit payment and receive confirmation

---

## Architecture Overview

```mermaid
flowchart TD
    A[Tenant Payments Page] --> B{Pending Amount?}
    B -->|Yes| C[Show Pending Card with "Make Payment" Button]
    B -->|No| D[Show "All Settled" Card]
    C --> E[Click "Make Payment"]
    D --> E
    E --> F[Make Payment Page with Form]
    F --> G[Submit Form]
    G --> H{Validation Pass?}
    H -->|No| I[Show Error Alert]
    I --> F
    H -->|Yes| J[Show Confirmation Dialog]
    J --> K{User Action}
    K --> L[Verify - Proceed to Processing]
    K --> M[Edit - Close Dialog, Reopen Form]
    L --> N[Submit to Backend]
    N --> O{Submission Success?}
    O -->|No| I
    O -->|Yes| P[Show Success Alert]
    P --> Q[Redirect to Payments Page with Toast]
```

---

## Part 1: Backend Implementation

### 1.1 Database Migrations

**File**: `database/migrations/2026_03_14_184940_add_payment_fields.php`

Add columns to track due dates and reference information:

```php
Schema::table('payments', function (Blueprint $table) {
    $table->date('due_date')->nullable()->after('paid_at');
    $table->string('reference_number')->nullable()->after('status');
    $table->text('notes')->nullable()->after('reference_number');
});
```

**File**: `database/migrations/2026_03_14_185000_add_payment_indexes_and_cancelled_status.php`

Add indexes and cancelled status:

```php
Schema::table('payments', function (Blueprint $table) {
    $table->index('tenant_id');
    $table->index('tenancy_id');
    $table->index('status');
    $table->index('paid_at');
    $table->timestamp('cancelled_at')->nullable()->after('status');
});

// Update status enum to include 'cancelled'
DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('paid', 'partial', 'overdue', 'cancelled') DEFAULT 'overdue'");
```

**Current table structure:**
- `payment_type` - ENUM('rent', 'utility')
- `payment_method` - STRING
- `status` - ENUM('paid', 'partial', 'overdue', 'cancelled')
- `due_date` - DATE (nullable)
- `reference_number` - STRING (nullable)
- `notes` - TEXT (nullable)
- `cancelled_at` - TIMESTAMP (nullable)

### 1.2 Payment Model Updates

**File**: `app/Models/Payment.php`

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'tenant_id',
        'tenancy_id',
        'amount',
        'payment_type',        // rent, utility
        'payment_method',      // mobile_money, bank_transfer
        'status',             // paid, partial, overdue, cancelled
        'paid_at',
        'receipt_path',
        'due_date',          // NEW
        'reference_number',  // NEW
        'notes',             // NEW
    ];

    protected $dates = ['deleted_at'];

    /**
     * Calculate payment status based on total paid vs monthly rent.
     * Only considers rent payments (not utilities) for status calculation.
     *
     * @param Tenancy|null $tenancy
     * @param string|null $paymentType Filter by payment type (rent or utility)
     */
    public function calculateStatus(Tenancy $tenancy = null, string $paymentType = null): string
    {
        // Implementation details in model file
    }
}
```

### 1.3 TenantPaymentsController Updates

**File**: `app/Http/Controllers/Web/Tenant/TenantPaymentsController.php`

**Methods implemented:**

1. `index()` - Enhanced to include pending amount calculation
2. `makePayment()` - Shows the make payment page
3. `storePayment()` - Handles both create (POST) and update (PATCH) via route model binding

**Key implementation details:**

```php
// Pending amount calculation - only considers RENT payments
$totalPaid = $activeTenancy->payments()
    ->whereIn('status', ['paid', 'partial'])
    ->where('payment_type', 'rent')
    ->sum('amount');
$pendingAmount = max(0, $monthlyRent - $totalPaid);

// Duplicate payment prevention (30 second window)
$recentDuplicate = $activeTenancy->payments()
    ->where('amount', $validated['amount'])
    ->where('payment_method', $validated['payment_method'])
    ->where('payment_type', $validated['payment_type'])
    ->where('created_at', '>=', now()->subSeconds(30))
    ->exists();

// DB transaction with row locking
$result = DB::transaction(function () use ($activeTenancy, $validated, $existingPayment, $tenant) {
    $lockedPayments = $activeTenancy->payments()
        ->lockForUpdate()
        ->get();
    // ...
});

// Payment ownership verification for updates
if ($existingPayment && $existingPayment->tenant_id !== $tenant->id) {
    abort(403, 'Unauthorized access to this payment.');
}
```

### 1.4 Route Definitions

**File**: `routes/web.php`

```php
Route::prefix('tenant')->middleware(['auth'])->group(function () {
    // ... existing routes ...
    
    Route::get('/payments/make', [TenantPaymentsController::class, 'makePayment'])
        ->name('tenant.payments.make');
    
    Route::post('/payments', [TenantPaymentsController::class, 'storePayment'])
        ->name('tenant.payments.store')
        ->middleware('throttle:5,1');

    Route::patch('/tenant/payments/{payment}', [TenantPaymentsController::class, 'storePayment'])
        ->name('tenant.payments.update')
        ->middleware('throttle:5,1');
});
```

---

## Part 2: Frontend Implementation

### 2.1 Tenant Payments Page

**File**: `resources/js/pages/tenant/payments.tsx`

Features:
- Pending payment card (amber) showing amount due
- "All Settled" card (green) when no pending amount
- Payment history list with status badges
- Flash message display using useEffect + toast

### 2.2 Make Payment Page

**File**: `resources/js/pages/tenant/payments/make.tsx` (new)

**Form Structure:**

```typescript
interface PaymentFormData {
    amount: number;
    payment_type: 'rent' | 'utility';
    payment_method: 'mobile_money' | 'bank_transfer';
    reference_number?: string;
    notes?: string;
}
```

**Component Sections:**
1. Payment Details - Amount input, Payment type selector
2. Payment Method - Mobile Money / Bank Transfer selection
3. Additional Information - Reference number, Notes

### 2.3 Form Validation

**File**: `resources/js/pages/tenant/payments/make.tsx`

```typescript
const paymentSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be at least 1'),
    payment_type: z.enum(['rent', 'utility']),
    payment_method: z.enum(['mobile_money', 'bank_transfer'], {
        required_error: 'Please select a payment method',
    }),
    reference_number: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
});
```

**Enum values from database:**
- `payment_type`: 'rent', 'utility'
- `payment_method`: 'mobile_money', 'bank_transfer'
- `status`: 'paid', 'partial', 'overdue', 'cancelled'

### 2.4 Confirmation Dialog

Uses shadcn Dialog component to show payment summary before final submission.

### 2.5 Success Handling

- Shows success Alert component after submission
- Redirects to payments page with flash message
- Flash message displayed via toast notification

---

## Part 3: UI/UX Flow

### 3.1 Tenant Payments Page

```
┌─────────────────────────────────────────────────────┐
│  Tenant Payments                           [+ New] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Pending Payment                            │   │
│  │  TZS 500,000                                │   │
│  │  Monthly Rent: TZS 500,000                 │   │
│  │  [Make Payment]                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  OR (if all settled):                              │
│  ┌─────────────────────────────────────────────┐   │
│  │  ✓ All Payments Settled                    │   │
│  │  You have no pending payments              │   │
│  │  [Add Payment]                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Payment History                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  15 Jan  - TZS 500,000 - Rent - Paid      │   │
│  │  15 Dec  - TZS 500,000 - Rent - Paid      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Make Payment Page

```
┌─────────────────────────────────────────────────────┐
│  ← Back                      Make Payment           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Payment Details                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  Amount *                    [500,000    ] │   │
│  │  Payment Type *              [Rent      v] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Payment Method                                     │
│  ┌──────────┐  ┌──────────┐                       │
│  │  (o)     │  │  ( )     │                       │
│  │ Mobile   │  │ Bank     │                       │
│  │ Money    │  │ Transfer │                       │
│  └──────────┘  └──────────┘                       │
│                                                     │
│  Additional Information                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  Reference Number           [MNO-2026-001] │   │
│  │  Notes                      [        ]     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│                    [ Continue to Confirm ]          │
└─────────────────────────────────────────────────────┘
```

### 3.3 Confirmation Dialog

```
┌─────────────────────────────────────────────────────┐
│                      ×                              │
│                                                     │
│              Confirm Payment                        │
│                                                     │
│  Please review your payment details:               │
│                                                     │
│  Amount:        TZS 500,000                        │
│  Payment Type:  Rent                                │
│  Method:        Mobile Money                       │
│  Reference:     MNO-2026-001                       │
│                                                     │
│  ─────────────────────────────────────            │
│                                                     │
│         [ Edit ]        [ Verify & Submit ]        │
└─────────────────────────────────────────────────────┘
```

---

## Part 4: Implementation Steps Summary

| Step | Component | File(s) | Status |
|------|-----------|---------|--------|
| 1 | Migration | `database/migrations/2026_03_14_184940_add_payment_fields.php` | ✅ |
| 2 | Migration | `database/migrations/2026_03_14_185000_add_payment_indexes_and_cancelled_status.php` | ✅ |
| 3 | Model | `app/Models/Payment.php` | ✅ Added SoftDeletes, fillables, calculateStatus |
| 4 | Controller | `app/Http/Controllers/Web/Tenant/TenantPaymentsController.php` | ✅ |
| 5 | Routes | `routes/web.php` | ✅ |
| 6 | Payments Page | `resources/js/pages/tenant/payments.tsx` | ✅ |
| 7 | Make Payment Page | `resources/js/pages/tenant/payments/make.tsx` | ✅ |

---

## Technology Stack Used

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 19, TypeScript, Inertia.js
- **UI Components**: shadcn/ui (Dialog, Alert, Button, Input, Select, etc.)
- **Validation**: Zod
- **Icons**: Lucide React
- **State**: React useState
- **Notifications**: Sonner toast

---

## Payment Status Calculation Logic

```php
// In storePayment method
$query = $activeTenancy->payments()
    ->whereIn('status', ['paid', 'partial'])
    ->where('payment_type', 'rent');

// Exclude existing payment if updating
if ($existingPayment) {
    $query->where('id', '!=', $existingPayment->id);
}

$currentTotalPaid = $query->sum('amount');
$newTotalPaid = $currentTotalPaid + $validated['amount'];

// Determine status
$status = 'partial';
if ($newTotalPaid >= $monthlyRent) {
    $status = 'paid';
}
```

**Key Implementation Notes:**
- Only `payment_type = 'rent'` payments count toward monthly rent status
- Utility payments are tracked separately and don't affect rent status
- Both 'paid' and 'partial' status payments are counted toward total

**Status Enum Values**: 'paid', 'partial', 'overdue', 'cancelled'

---

## Security Features Implemented

1. **Payment Ownership Verification** - Ensures tenant can only modify their own payments
2. **Duplicate Payment Prevention** - 30-second window to prevent double submissions
3. **DB Transaction with Row Locking** - Prevents race conditions
4. **Rate Limiting** - Throttle middleware (5 requests per minute)
5. **Logging** - All payment operations are logged

---

## Success Criteria

1. ✅ Tenant can view pending rent amount on payments page
2. ✅ Tenant can click "Make Payment" to create a new payment
3. ✅ Form validation shows clear error messages for invalid fields
4. ✅ Confirmation dialog shows summary before final submission
5. ✅ "Edit" button reopens form for modifications
6. ✅ "Verify & Submit" button proceeds to final submission
7. ✅ Success alert shown after submission
8. ✅ Payment status correctly calculated (paid/partial)
9. ✅ Tenant redirected to payments page with success notification
10. ✅ Flash messages displayed as toast notifications
