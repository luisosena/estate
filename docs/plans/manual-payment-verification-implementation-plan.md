# Manual Payment Verification — Implementation Plan

> **Branch context**: Working on `main` (or feature branch off `main`).  
> **Status**: Ready to implement. All design decisions are locked.  
> **Scaffold hold**: The gateway-based payment scaffold (`PaymentGatewayInterface`, `MpesaGateway`, `PaymentGatewayServiceProvider`, etc.) is intentionally **not wired** and must remain untouched during this work.  
> **UI rule**: Strictly use **shadcn/ui components** for all frontend work. No custom-made UI components. If a needed component doesn't exist in the project, install it via `npx shadcn@latest add <component>`.

---

## 1. Feature Overview

The landlord receives a payment from a tenant **outside the app** (cash, mobile money, bank transfer). They navigate to the tenant's page and record the payment, selecting which rent bill(s) it covers. The system creates payment records, updates bill statuses, tracks who recorded it, and lets the landlord download a PDF receipt.

### User Flow

```
Landlord → /landlord/tenants (search for tenant)
         → Clicks "View" → /landlord/tenants/{tenant_code} (tenant show page)
         → Payment section is always visible
         → Clicks "Record Payment" → Opens RecordPaymentModal
         → Step 1: Select bill(s) — existing outstanding + on-demand month creation
         → Step 2: Enter amount + payment method (Mobile Money | Bank Transfer)
         → Step 3: Confirmation preview — allocation breakdown, overpayment warning
         → Confirms → POST /landlord/tenants/{tenant}/payments
         → Success → Redirect back to tenant show page with flash + "Download Receipt" link
```

---

## 2. Design Decisions (Locked)

| # | Decision | Chosen Approach |
|---|---|---|
| 1 | Entry point | **Option A** — Embedded on tenant show page (global entry point deferred to post-MVP) |
| 2 | Bill scope | **Rent bills only** — utility bills excluded from this flow |
| 3 | Multi-bill allocation | **Sequential, oldest first** — one payment record per bill, all in one DB transaction |
| 4 | Overpayment handling | Excess allocated to the **last selected bill** (marks it overpaid). Confirmation step warns but allows proceed |
| 5 | On-demand bill creation | If no outstanding bills exist or landlord picks a month without a bill, the system **auto-creates `RentBill` records** before processing — zero friction |
| 6 | Payment methods | **Mobile Money** and **Bank Transfer** only |
| 7 | Confirmation step | Required — shows tenant name, amount, allocation preview, overpayment warning, proceed/edit buttons |
| 8 | Receipt | PDF downloadable immediately after recording (existing `ReceiptService`) |
| 9 | Audit trail | New `recorded_by` column on `payments` table (FK → `users.id`) |

---

## 3. UI Component Rules

**Strictly use shadcn/ui components — no custom-made UI components.**

- All UI elements (buttons, inputs, selects, dialogs, tables, badges, cards, alerts, etc.) must come from the project's shadcn/ui component library at `resources/js/components/ui/`.
- If a component you need doesn't already exist (e.g., `Checkbox`, `Toggle Group`, `Calendar`, `Popover`), install it:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Do **not** write raw HTML elements (e.g., `<button>`, `<input>`, `<select>`) — always wrap in the shadcn primitive.
- Do **not** create custom wrapper components that duplicate what shadcn already provides.
- Styling must use Tailwind utility classes composed via `cn()` / `clsx()` — consistent with existing shadcn components.
- The new `RecordPaymentModal` should use: `Dialog` (shadcn), `Checkbox` (shadcn), `Button`, `Input`, `Select`, `Label`, `Alert`, `Badge`, `Separator`, `Card`, `Table` — all from `@/components/ui/`.

---

## 4. Key Existing Files

| Purpose | Path |
|---|---|
| Payment model | `app/Models/Payment.php` |
| RentBill model | `app/Models/RentBill.php` |
| Landlord payment controller (web) | `app/Http/Controllers/Web/Landlord/LandlordPaymentController.php` |
| Payment store form request | `app/Http/Requests/Landlord/PaymentStoreRequest.php` |
| RentBillService | `app/Services/RentBillService.php` |
| TenantService (search) | `app/Services/Landlord/TenantService.php` |
| Landlord tenant controller | `app/Http/Controllers/Web/Landlord/LandlordTenantController.php` |
| Tenant show page | `resources/js/pages/landlord/tenants/show.tsx` |
| Tenant index page | `resources/js/pages/landlord/tenants/index.tsx` |
| Tenant edit modal | `resources/js/components/tenant-edit-modal.tsx` |
| ReceiptService | `app/Services/ReceiptService.php` |
| Web routes | `routes/web.php` |
| Enums | `app/Enums/BillStatus.php`, `PaymentStatus.php`, `PaymentMethod.php` |
| Existing payment tests | `tests/Feature/Landlord/PaymentTest.php` |

---

## 5. Implementation Steps

### Phase 1: Database & Model Changes

#### 1.1 — Migration: add `recorded_by` to payments table

Create: `database/migrations/xxxx_xx_xx_add_recorded_by_to_payments_table.php`

```bash
php artisan make:migration add_recorded_by_to_payments_table
```

```php
public function up(): void
{
    Schema::table('payments', function (Blueprint $table) {
        $table->foreignId('recorded_by')
            ->nullable()
            ->after('notes')
            ->constrained('users')
            ->nullOnDelete()
            ->index();
    });
}

public function down(): void
{
    Schema::table('payments', function (Blueprint $table) {
        $table->dropForeign(['recorded_by']);
        $table->dropColumn('recorded_by');
    });
}
```

#### 1.2 — Update `Payment` model

In `app/Models/Payment.php`:
- Add `'recorded_by'` to the `$fillable` array
- Add a `recordedBy()` relationship:

```php
public function recordedBy(): BelongsTo
{
    return $this->belongsTo(User::class, 'recorded_by');
}
```

---

### Phase 2: Backend — Search Extension

#### 2.1 — Extend `TenantService::getTenantList()` search

In `app/Services/Landlord/TenantService.php`, update the search block (around line 34-40) to also match on unit name and unit code:

```php
if ($search) {
    $query->where(function ($q) use ($search) {
        $q->where('full_name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->orWhere('tenant_code', 'like', "%{$search}%")
            ->orWhereHas('tenancies.unit', function ($uq) use ($search) {
                $uq->where('unit_name', 'like', "%{$search}%")
                    ->orWhere('unit_code', 'like', "%{$search}%");
            });
    });
}
```

**Verification**: Run the existing tenant index page, use search with a unit code — should filter correctly.

---

### Phase 3: Backend — Tenant Show Page Data

#### 3.1 — Pass outstanding rent bills to tenant show page

In `app/Http/Controllers/Web/Landlord/LandlordTenantController.php`, method `show()` (around line 83):

Add to the Inertia render data:
```php
'outstandingRentBills' => $activeTenancy
    ? RentBill::where('tenancy_id', $activeTenancy->id)
        ->whereIn('status', ['pending', 'partial', 'overdue'])
        ->orderBy('billing_month')
        ->get()
        ->map(fn (RentBill $bill) => [
            'id' => $bill->id,
            'billing_month' => $bill->billing_month->format('Y-m'),
            'billing_month_label' => $bill->billing_month->format('M Y'),
            'amount_due' => (float) $bill->amount_due,
            'amount_paid' => (float) $bill->amount_paid,
            'outstanding' => (float) $bill->outstanding_amount,
            'status' => $bill->status->value,
        ])
    : collect(),
'monthlyRent' => $activeTenancy?->monthly_rent ?? 0,
```

Update the `Props` interface in `show.tsx` to include `outstandingRentBills` and `monthlyRent`.

---

### Phase 4: Backend — Multi-Bill Payment Endpoint

#### 4.1 — New FormRequest: `RecordPaymentRequest`

Create: `app/Http/Requests/Landlord/RecordPaymentRequest.php`

```bash
php artisan make:request Landlord/RecordPaymentRequest
```

```php
public function authorize(): bool
{
    return $this->user() && $this->user()->role === Role::Landlord;
}

public function rules(): array
{
    return [
        'amount' => 'required|numeric|min:1',
        'payment_method' => ['required', Rule::in(['mobile_money', 'bank_transfer'])],
        'rent_bill_ids' => 'nullable|array',
        'rent_bill_ids.*' => 'integer|exists:rent_bills,id',
        'billing_months' => 'nullable|array',
        'billing_months.*' => 'date_format:Y-m',
        'reference_number' => 'nullable|string|max:255',
        'notes' => 'nullable|string|max:1000',
    ];
}
```

**Validation rules explanation**:
- `amount` — total amount received (must be positive)
- `payment_method` — only `mobile_money` or `bank_transfer`
- `rent_bill_ids` — array of existing rent bill IDs to cover
- `billing_months` — array of month strings (e.g. `["2026-04", "2026-05"]`) for on-demand bill creation
- At least one of `rent_bill_ids` or `billing_months` must be provided (add custom validation)

#### 4.2 — New controller method: `recordPayment()`

Add a new method to `LandlordPaymentController` (or create a dedicated method — keep in existing controller for simplicity):

```php
public function recordPayment(RecordPaymentRequest $request, Tenant $tenant): RedirectResponse
```

**Route** (add to `routes/web.php`):
```php
Route::post('/landlord/tenants/{tenant}/record-payment', [LandlordPaymentController::class, 'recordPayment'])
    ->name('landlord.tenants.payments.record');
```

#### 4.3 — `recordPayment()` Implementation Logic

```
1. Authorize: landlord owns the tenant's property
2. Get active tenancy for the tenant
3. DB::transaction:
   a. On-demand bill creation:
      - For each month in `billing_months`:
        - Check if a RentBill already exists for that tenancy + month
        - If not, create one: amount_due = tenancy.monthly_rent, billing_month = Carbon::parse($month)->startOfMonth(), due_date = end of that month, status = pending
      - Collect all bill IDs (existing + newly created)
   b. Fetch all target bills (by combined IDs), ordered by billing_month ASC
   c. Validate no bill is already paid/waived
   d. Sequential allocation:
      - remaining = amount
      - For each bill (oldest first):
        - allocated = min(remaining, bill.outstanding_amount)
        - remaining -= allocated
      - If remaining > 0 after all bills:
        - Add remaining to the LAST bill's allocation (overpayment)
   e. Create payment records:
      - For each bill, create one Payment record:
        - tenant_id, tenancy_id, rent_bill_id, amount = allocated
        - payment_type = 'rent', payment_method = validated method
        - status = 'paid' (if allocated >= outstanding) or 'partial' (if less)
        - paid_at = now()
        - recorded_by = auth()->id()
        - reference_number, notes from request
      - Call RentBillService::processRentPayment() for each bill
   f. Return redirect to tenant show page with:
      - success flash message
      - created payment IDs (for receipt download)
4. On exception: redirect back with error
```

**Key code structure**:

```php
public function recordPayment(RecordPaymentRequest $request, Tenant $tenant): RedirectResponse
{
    $this->authorize('update', $tenant);

    $landlord = $request->user();
    $validated = $request->validated();

    $activeTenancy = $tenant->tenancies()->where('status', 'active')->first();
    if (! $activeTenancy) {
        return redirect()->back()->with('error', 'This tenant has no active tenancy.');
    }

    try {
        $result = DB::transaction(function () use ($validated, $activeTenancy, $tenant, $landlord) {
            // 1. On-demand bill creation
            $billIds = $validated['rent_bill_ids'] ?? [];
            $billingMonths = $validated['billing_months'] ?? [];

            foreach ($billingMonths as $month) {
                $billingMonth = Carbon::parse($month . '-01')->startOfMonth();
                $existing = RentBill::where('tenancy_id', $activeTenancy->id)
                    ->where('billing_month', $billingMonth)
                    ->first();

                if (! $existing) {
                    $newBill = RentBill::create([
                        'tenancy_id' => $activeTenancy->id,
                        'billing_month' => $billingMonth,
                        'amount_due' => $activeTenancy->monthly_rent,
                        'amount_paid' => 0,
                        'due_date' => $billingMonth->copy()->endOfMonth(),
                        'status' => 'pending',
                    ]);
                    $billIds[] = $newBill->id;
                } else {
                    $billIds[] = $existing->id;
                }
            }

            // 2. Fetch bills ordered by billing_month ASC
            $bills = RentBill::whereIn('id', $billIds)
                ->where('tenancy_id', $activeTenancy->id)
                ->orderBy('billing_month')
                ->get();

            // 3. Validate bills are payable
            foreach ($bills as $bill) {
                if (in_array($bill->status, [BillStatus::Paid, BillStatus::Waived])) {
                    throw new \InvalidArgumentException(
                        "Bill for {$bill->billing_month->format('M Y')} is already {$bill->status->value}."
                    );
                }
            }

            // 4. Sequential allocation
            $totalAmount = (float) $validated['amount'];
            $remaining = $totalAmount;
            $allocations = [];

            foreach ($bills as $i => $bill) {
                $outstanding = (float) $bill->outstanding_amount;
                $allocated = min($remaining, $outstanding);
                $remaining -= $allocated;
                $allocations[$bill->id] = $allocated;
            }

            // 5. Overpayment → add to last bill
            if ($remaining > 0 && ! empty($allocations)) {
                $lastBillId = array_key_last($allocations);
                $allocations[$lastBillId] += $remaining;
            }

            // 6. Create payment records + process bills
            $payments = [];
            foreach ($allocations as $billId => $allocated) {
                $bill = $bills->firstWhere('id', $billId);
                $outstanding = (float) $bill->outstanding_amount;

                $status = $allocated >= $outstanding ? 'paid' : 'partial';

                $paymentData = [
                    'tenant_id' => $tenant->id,
                    'tenancy_id' => $activeTenancy->id,
                    'rent_bill_id' => $billId,
                    'amount' => $allocated,
                    'payment_type' => 'rent',
                    'payment_method' => $validated['payment_method'],
                    'status' => $status,
                    'paid_at' => now(),
                    'recorded_by' => $landlord->id,
                    'reference_number' => $validated['reference_number'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ];

                $payment = Payment::create($paymentData);
                $this->rentBillService->processRentPayment($bill, $allocated);

                // Sync payment status from bill (source of truth)
                $bill->refresh();
                $payment->status = PaymentStatus::from($bill->status->value);
                $payment->save();

                $payments[] = $payment;
            }

            return $payments;
        });

        $paymentIds = collect($result)->pluck('id')->toArray();

        Log::info('Manual payment recorded', [
            'tenant_id' => $tenant->id,
            'landlord_id' => $landlord->id,
            'payment_ids' => $paymentIds,
            'total_amount' => $validated['amount'],
        ]);

        return redirect()
            ->route('landlord.tenants.show', ['tenant' => $tenant->tenant_code])
            ->with('success', 'Payment recorded successfully.')
            ->with('recorded_payment_ids', $paymentIds);

    } catch (\InvalidArgumentException $e) {
        return redirect()->back()->with('error', $e->getMessage());
    } catch (\Exception $e) {
        Log::error('Failed to record manual payment', [
            'tenant_id' => $tenant->id,
            'error' => $e->getMessage(),
        ]);
        return redirect()->back()->with('error', 'Failed to record payment. Please try again.');
    }
}
```

**Important**: The existing `store()` method on `LandlordPaymentController` is **not modified** — it remains for backward compatibility. The new `recordPayment()` is a dedicated endpoint for the new flow.

---

### Phase 5: Frontend — Search on Tenant Index Page

#### 5.1 — Add search input to `resources/js/pages/landlord/tenants/index.tsx`

Add a search input in the filter section (near the property dropdown, around line 242-263). Use debounced `router.get` to avoid hammering the server:

```tsx
import { Input } from '@/components/ui/input';

// State
const [searchQuery, setSearchQuery] = useState(filters?.search || '');

// Debounced search
useEffect(() => {
    const timeout = setTimeout(() => {
        router.get('/landlord/tenants', {
            search: searchQuery || undefined,
            property: currentProperty === 'all' ? undefined : currentProperty,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 300);
    return () => clearTimeout(timeout);
}, [searchQuery]);
```

Place the `<Input>` next to the property filter with a search icon.

---

### Phase 6: Frontend — Tenant Show Page Changes

#### 6.1 — Make payment section always visible

In `resources/js/pages/landlord/tenants/show.tsx`:

Currently the payment card only renders when `(payments.data || []).length > 0` (line 424). Change to **always render** the card:

- Always show the "Recent Payments" card header with the "Record Payment" button
- Show the table when payments exist
- Show the empty state ("No payments yet") when empty
- The "Record Payment" button should be **prominent** — not hidden inside the table header

```tsx
{/* Always visible payment section */}
<Card className="mb-6">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
            <CardTitle className="text-lg font-medium">Payments</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
                {outstandingRent > 0
                    ? `Outstanding: ${formatCurrency(outstandingRent)}`
                    : 'All rent paid'}
            </p>
        </div>
        <Button onClick={() => setShowRecordPaymentModal(true)}>
            Record Payment
        </Button>
    </CardHeader>
    <CardContent>
        {payments.length > 0 ? (
            <Table>...</Table>
        ) : (
            <div className="text-center py-8">
                <p>No payments recorded yet.</p>
            </div>
        )}
    </CardContent>
</Card>
```

#### 6.2 — Add `outstandingRentBills` and `monthlyRent` to Props interface

```tsx
interface OutstandingRentBill {
    id: number;
    billing_month: string;        // "2026-04"
    billing_month_label: string;  // "Apr 2026"
    amount_due: number;
    amount_paid: number;
    outstanding: number;
    status: string;
}

interface Props {
    // ... existing props ...
    outstandingRentBills: OutstandingRentBill[];
    monthlyRent: number;
}
```

#### 6.3 — Add Record Payment Modal

Create a **new component**: `resources/js/components/record-payment-modal.tsx`

This is a multi-step modal with 3 steps + success state. See Phase 7 below.

#### 6.4 — Flash message + receipt download

After successful recording, the page reloads with a flash message. Add a flash message display and a receipt download button that links to:

```
/landlord/payments/{paymentId}/receipt
```

For multi-bill payments (multiple payment IDs), offer receipt download for each or a combined receipt. For MVP, offer download for the **first** payment record and let the landlord access others from the payments table.

---

### Phase 7: Frontend — Record Payment Modal Component

#### 7.1 — Component: `resources/js/components/record-payment-modal.tsx`

**Props**:
```tsx
interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: { full_name: string; tenant_code: string };
    tenancy: { id: number; monthly_rent: number };
    outstandingRentBills: OutstandingRentBill[];
    monthlyRent: number;
}
```

**State**:
```tsx
const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
const [selectedBillIds, setSelectedBillIds] = useState<number[]>([]);
const [additionalMonths, setAdditionalMonths] = useState<string[]>([]);
const [amount, setAmount] = useState('');
const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'bank_transfer'>('mobile_money');
const [referenceNumber, setReferenceNumber] = useState('');
const [notes, setNotes] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Step 1 — Select Bills**:
- Show outstanding rent bills as checkboxes with: month label, amount due, outstanding amount, status badge
- Show "Add month" section — a month/year picker that lets the landlord add months not yet billed
- When a new month is added, it appears in the list with "(will be created)" label
- "Continue" button enabled when at least one bill/month is selected

**Step 2 — Payment Details**:
- Amount input (numeric, TZS format)
- Auto-suggested amount = sum of selected bills' outstanding amounts
- Payment method: two toggle buttons — "Mobile Money" / "Bank Transfer"
- Reference number (optional text input)
- Notes (optional textarea)
- "Review" button → goes to Step 3

**Step 3 — Confirmation Preview**:
- Summary card showing:
  - Tenant name
  - Total amount entered
  - Allocation breakdown table:
    ```
    Apr 2026 Rent  →  TZS 150,000  ✓ Fully paid
    May 2026 Rent  →  TZS 150,000  ✓ Fully paid
    Jun 2026 Rent  →  TZS 100,000  ⚠ Partial (TZS 50,000 remaining)
    ```
  - If overpayment:
    ```
    ⚠ Overpayment: May bill receives TZS 200,000 (TZS 50,000 over the TZS 150,000 due)
    ```
  - Payment method, reference number
- Buttons: "Confirm & Record" (primary), "Edit Entry" (outline, goes back to step 2)

**Submission**:
```tsx
router.post(route('landlord.tenants.payments.record', { tenant: tenant.tenant_code }), {
    amount: amount,
    payment_method: paymentMethod,
    rent_bill_ids: selectedBillIds,
    billing_months: additionalMonths,
    reference_number: referenceNumber,
    notes: notes,
}, {
    onSuccess: () => {
        onClose();
        // Page reloads with flash message
    },
    onError: (errors) => { /* display errors */ },
    onFinish: () => setIsSubmitting(false),
});
```

**Allocation preview computation** (client-side):
```tsx
function computeAllocation(bills: SelectedBill[], totalAmount: number) {
    let remaining = totalAmount;
    return bills.map((bill, index) => {
        const allocated = Math.min(remaining, bill.outstanding);
        remaining -= allocated;
        const isLast = index === bills.length - 1;
        // Overpayment goes to last bill
        const finalAllocated = isLast ? allocated + remaining : allocated;
        return {
            ...bill,
            allocated: finalAllocated,
            isOverpayment: finalAllocated > bill.outstanding,
            overpaymentAmount: Math.max(0, finalAllocated - bill.outstanding),
        };
    });
}
```

---

### Phase 8: Tests

All tests in `tests/Feature/Landlord/` using Pest.

#### 8.1 — `RecordPaymentTest.php`

```bash
php artisan make:test Landlord/RecordPaymentTest --pest
```

**Test cases**:

1. **Landlord can record a single-bill payment**
   - Create tenant, tenancy, rent bill
   - POST to record-payment with one bill ID
   - Assert payment created, bill updated to `paid`, `recorded_by` = landlord ID

2. **Landlord can record a multi-bill payment with sequential allocation**
   - Create 3 rent bills (Apr, May, Jun — each 150k)
   - POST with amount 300k, all 3 bill IDs
   - Assert: Apr bill → paid (150k), May bill → paid (150k), Jun bill → unchanged
   - Assert: 2 payment records created

3. **Overpayment is allocated to the last bill**
   - Create 2 bills (150k each)
   - POST with amount 350k
   - Assert: Apr → paid (150k), May → paid (200k, overpaid)
   - Assert: 2 payment records, last one has amount 200k

4. **On-demand bill creation when no bills exist**
   - Create tenant + tenancy, NO rent bills
   - POST with billing_months: ["2026-06"]
   - Assert: RentBill created for June, payment created against it

5. **Mixed existing + on-demand bills**
   - Create April bill, no May bill
   - POST with rent_bill_ids: [april_id], billing_months: ["2026-05"]
   - Assert: May bill auto-created, both bills processed

6. **Cannot record against already-paid bill**
   - Create a paid bill
   - POST with that bill ID
   - Assert: 302 redirect with error message

7. **Non-landlord cannot record payment**
   - Authenticate as tenant
   - POST to record-payment
   - Assert: 403 forbidden

8. **Validation: amount required and positive**
   - POST with amount: 0 → 422
   - POST with amount: -100 → 422
   - POST with no amount → 422

9. **Validation: only mobile_money and bank_transfer allowed**
   - POST with payment_method: 'cash' → 422
   - POST with payment_method: 'mpesa' → 422

10. **recorded_by is set correctly**
    - Record a payment
    - Assert: payment.recorded_by === landlord.id

11. **Search extension: find tenant by unit code**
    - GET /landlord/tenants?search=UNIT-001
    - Assert: tenant in that unit appears in results

---

## 6. Execution Order

```
Phase 1 → Migration + Model (1.1, 1.2)
  ↓ run migration, verify with php artisan tinker
Phase 2 → Search extension (2.1)
  ↓ verify on tenant index page
Phase 3 → Tenant show data (3.1)
  ↓ verify outstanding bills appear in props
Phase 4 → Backend endpoint (4.1, 4.2, 4.3)
  ↓ run Phase 8 tests against the endpoint
Phase 5 → Frontend search (5.1)
  ↓ verify search works on tenant index
Phase 6 → Tenant show changes (6.1, 6.2, 6.3, 6.4)
  ↓ verify payment section always visible
Phase 7 → Record Payment Modal (7.1)
  ↓ end-to-end manual test
Phase 8 → Tests (8.1)
  ↓ php artisan test --compact --filter=RecordPayment
Final → Pint + full test suite
  ↓ vendor/bin/pint --dirty --format agent
  ↓ php artisan test --compact
```

---

## 7. Routes Summary

| Method | URI | Name | Purpose |
|---|---|---|---|
| POST | `/landlord/tenants/{tenant}/record-payment` | `landlord.tenants.payments.record` | New multi-bill payment recording |
| GET | `/landlord/payments/{paymentId}/receipt` | `landlord.payments.receipt` | Existing — PDF receipt download |
| POST | `/landlord/tenants/{tenant}/payments` | `landlord.tenants.payments.store` | Existing — unchanged, backward compat |

---

## 8. Things NOT to Touch

- `PaymentGatewayServiceProvider` — remains unregistered
- `PaymentGatewayInterface`, `ManualGateway`, `MpesaGateway` — scaffold, do not modify
- `PaymentService::processGatewayPayment()` — scaffold method, do not modify
- `config/payments.php` — scaffold config, leave as-is
- `PaymentConfirmed` event + `ProcessPaymentConfirmed` listener — leave as-is (already wired in AppServiceProvider but never dispatched)
- `app/Http/Controllers/Api/` — API controllers unchanged for MVP
- Mobile app — no changes to React Native code
- Existing `store()` method on `LandlordPaymentController` — preserved for backward compatibility

---

## 9. Post-Implementation Checklist

- [ ] `php artisan migrate` runs cleanly
- [ ] `php artisan test --compact --filter=RecordPayment` — all pass
- [ ] `php artisan test --compact` — full suite passes (no regressions)
- [ ] `vendor/bin/pint --dirty --format agent` — clean
- [ ] `npx tsc --noEmit` — no TypeScript errors (if applicable)
- [ ] Manual E2E: Search tenant → view → record payment → confirmation → receipt download
- [ ] Manual E2E: Record payment with on-demand bill creation (no existing bills)
- [ ] Manual E2E: Record payment with overpayment (verify warning + allocation)
