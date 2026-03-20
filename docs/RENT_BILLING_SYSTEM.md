## Architecture Overview

### New Files Created:

1. **[`database/migrations/2026_03_21_000001_create_rent_bills_table.php`](database/migrations/2026_03_21_000001_create_rent_bills_table.php)** - Creates the `rent_bills` table with fields:
   - `tenancy_id` - Foreign key to tenancies
   - `billing_month` - The month the bill is for
   - `amount_due` - The monthly rent amount
   - `amount_paid` - Amount paid so far
   - `due_date` - Payment due date
   - `status` - pending, paid, partial, overdue, waived

2. **[`app/Models/RentBill.php`](app/Models/RentBill.php)** - Model with:
   - Relationships: `tenancy()`, `payments()`
   - Scopes: `pending()`, `overdue()`
   - Helper methods: `markPaid()`, `getOutstandingAmountAttribute()`

3. **[`app/Console/Commands/GenerateMonthlyRentBills.php`](app/Console/Commands/GenerateMonthlyRentBills.php)** - Command to generate monthly rent bills for all active tenancies (runs on 1st of each month at 00:02)

4. **[`app/Console/Commands/MarkOverdueRentBills.php`](app/Console/Commands/MarkOverdueRentBills.php)** - Command to mark overdue rent bills (runs daily at 00:30)

5. **[`app/Services/RentBillService.php`](app/Services/RentBillService.php)** - Service for processing rent payments with methods:
   - `processRentPayment()` - Updates bill status based on payment
   - `waiveRentBill()` - Marks bill as waived
   - `getCurrentMonthBill()` - Gets current month's bill
   - `getPendingBills()` - Gets all pending bills
   - `calculateTotalOutstanding()` - Calculates total owed

### Modified Files:

1. **[`database/migrations/2026_03_21_000002_add_rent_bill_id_to_payments_table.php`](database/migrations/2026_03_21_000002_add_rent_bill_id_to_payments_table.php)** - Adds `rent_bill_id` to payments table

2. **[`app/Models/Payment.php`](app/Models/Payment.php)** - Added:
   - `rent_bill_id` to fillable
   - `rentBill()` relationship
   - Validation for `rent_bill_id` in boot method

3. **[`app/Models/Tenancy.php`](app/Models/Tenancy.php)** - Added `rentBills()` relationship

4. **[`app/Console/Kernel.php`](app/Console/Kernel.php)** - Added scheduled commands for rent bill automation

## How It Works:

1. **Bill Generation**: On the 1st of each month, `rent-bills:generate-monthly` creates rent bills for all active tenancies based on their `monthly_rent`

2. **Payment Tracking**: Payments can now be linked to specific rent bills via `rent_bill_id`

3. **Overdue Handling**: Daily, `rent-bills:mark-overdue` marks bills as overdue if past due date

4. **Status Sync**: Similar to utility bills, rent bill status (paid/partial/overdue) syncs with payment status

## Key Differences from Utility Bills:

- Rent bills are simpler (no unit consumption tracking)
- Due date defaults to 5th of the month
- Directly linked to tenancy's `monthly_rent` field
- Can be waived by landlords

## Usage After Implementation:

```bash
# Run migrations
php artisan migrate

# Generate rent bills manually (if needed)
php artisan rent-bills:generate-monthly

# Mark overdue bills manually (if needed)
php artisan rent-bills:mark-overdue
```