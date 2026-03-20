# Frontend Implementation Plan - Rent Billing System

## Overview

This document outlines the frontend modifications required to integrate the Rent Billing System into the existing estate practice management application. The backend changes have already been implemented (see [`CHANGE_ANALYSIS_REPORT.md`](CHANGE_ANALYSIS_REPORT.md)), and this plan focuses on the corresponding frontend changes needed to provide a complete user experience.

---

## Backend Changes Summary

The backend implements a complete Rent Billing System with the following components:

| Component | Description |
|-----------|-------------|
| `rent_bills` table | Stores monthly rent bills with status tracking |
| `RentBill` model | Eloquent model with relationships to Tenancy, Payment, Tenant, Unit, Property |
| `RentBillService` | Business logic for payment processing, bill waiving, and bill management |
| Console Commands | `rent-bills:generate-monthly` and `rent-bills:mark-overdue` |
| API Endpoints | Full CRUD for landlords, read-only for tenants |
| Dashboard Data | Rent bill statistics added to both landlord and tenant dashboards |

---

## Current Frontend State

### Routes (Already Generated)
- **Landlord**: `/landlord/rent-bills` (index, show, waive)
- **Tenant**: `/tenant/rent-bills` (index, show)

### Pages (Need to be Created)
- ❌ No landlord rent bills list page
- ❌ No landlord rent bill detail page
- ❌ No tenant rent bills list page
- ❌ No tenant rent bill detail page

### Dashboards (Need Updates)
- Landlord: Missing rent bill statistics (`pending_rent_bills`, `overdue_rent_bills`, `total_rent_outstanding`)
- Tenant: Missing rent bill information (`rent_bills`, `current_month_bill`)

### Navigation (Need Updates)
- Landlord sidebar: No link to rent bills
- Tenant sidebar: No link to rent bills

---

## Implementation Tasks

### Phase 1: Dashboard Updates

#### 1.1 Update Landlord Dashboard

**File**: [`resources/js/pages/landlord/dashboard.tsx`](resources/js/pages/landlord/dashboard.tsx)

**Changes Required**:

1. **Update Props Interface**:
   ```typescript
   interface Stats {
     total_tenants: number;
     total_properties: number;
     total_units: number;
     monthly_revenue: number;
     // Add new fields
     pending_rent_bills: number;
     overdue_rent_bills: number;
     total_rent_outstanding: number;
   }
   ```

2. **Add New Stat Cards** (replace or add to existing cards):
   - **Pending Rent Bills**: Count of bills with `status = 'pending'`
   - **Overdue Rent Bills**: Count of bills that are overdue
   - **Total Outstanding**: Sum of all unpaid amounts

3. **Suggested Card Layout**:
   - Keep: Total Tenants, Properties, Monthly Revenue, Occupancy Rate
   - Add new row or modify existing to show:
     - Pending Rent Bills (with warning color)
     - Overdue Rent Bills (with danger color)
     - Total Outstanding Amount

#### 1.2 Update Tenant Dashboard

**File**: [`resources/js/pages/tenant/dashboard.tsx`](resources/js/pages/tenant/dashboard.tsx)

**Changes Required**:

1. **Update Props Interface**:
   ```typescript
   interface RentBill {
     id: number;
     billing_month: string;
     amount_due: number;
     amount_paid: number;
     due_date: string;
     status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
     outstanding_amount: number;
   }

   interface TenantDashboardProps {
     // ... existing props
     rent_bills?: RentBill[];
     current_month_bill?: RentBill | null;
   }
   ```

2. **Add Rent Bill Card**:
   - Display current month's rent bill status
   - Show amount due, amount paid, outstanding
   - Show due date with status indicator
   - Add "Pay Now" button linking to payment page

3. **Add Quick Link to Rent Bills Section**:
   - Show recent rent bills history
   - Link to full rent bills page

---

### Phase 2: Create Landlord Rent Bills Pages

#### 2.1 Create Landlord Rent Bills Index Page

**File**: `resources/js/pages/landlord/rent-bills/index.tsx` (new file)

**Features**:
- Table/list view of all rent bills
- Filter by status (pending, paid, partial, overdue, waived)
- Filter by property
- Filter by tenant
- Search functionality
- Pagination
- Quick actions: View details, Waive bill

**Components to Reuse**:
- Use existing [`DataTable`](resources/js/components/shared/data-table.tsx) component
- Use existing UI components (Card, Button, Badge, etc.)

**Route**: `GET /landlord/rent-bills`

**Props from Controller**:
```typescript
interface RentBill {
  id: number;
  tenancy_id: number;
  billing_month: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';
  notes?: string;
  tenant: {
    id: number;
    full_name: string;
  };
  unit: {
    id: number;
    unit_name: string;
    unit_code: string;
  };
  property: {
    id: number;
    name: string;
  };
  payments: Payment[];
  created_at: string;
  updated_at: string;
}
```

#### 2.2 Create Landlord Rent Bill Detail Page

**File**: `resources/js/pages/landlord/rent-bills/show.tsx` (new file)

**Features**:
- Full rent bill details
- Payment history for this bill
- Tenant information
- Unit/Property information
- Waive bill action (with confirmation modal)
- Mark as paid action

**Route**: `GET /landlord/rent-bills/{rentBill}`

---

### Phase 3: Create Tenant Rent Bills Pages

#### 3.1 Create Tenant Rent Bills Index Page

**File**: `resources/js/pages/tenant/rent-bills/index.tsx` (new file)

**Features**:
- List of tenant's rent bills
- Show status, billing month, amount, due date
- Pagination
- Link to make payment

**Route**: `GET /tenant/rent-bills`

#### 3.2 Create Tenant Rent Bill Detail Page

**File**: `resources/js/pages/tenant/rent-bills/show.tsx` (new file)

**Features**:
- Rent bill details
- Payment history
- Make payment button
- Download/print receipt option

**Route**: `GET /tenant/rent-bills/{rentBill}`

---

### Phase 4: Navigation Updates

#### 4.1 Update Landlord Sidebar

**File**: [`resources/js/components/layout/landlord-sidebar.tsx`](resources/js/components/layout/landlord-sidebar.tsx)

**Add Navigation Item**:
```typescript
{
  title: "Rent Bills",
  href: route('landlord.rent-bills.index'),
  icon: Receipt,
}
```

#### 4.2 Update Tenant Sidebar

**File**: [`resources/js/components/layout/tenant-sidebar.tsx`](resources/js/components/layout/tenant-sidebar.tsx)

**Add Navigation Item**:
```typescript
{
  title: "Rent Bills",
  href: route('tenant.rent-bills.index'),
  icon: Receipt,
}
```

---

### Phase 5: Payment Integration (Optional Enhancement)

#### 5.1 Update Payment Forms

**Files**:
- [`resources/js/pages/tenant/payments/make.tsx`](resources/js/pages/tenant/payments/make.tsx)
- [`resources/js/pages/landlord/payments/create.tsx`](resources/js/pages/landlord/payments/create.tsx) (if exists)

**Changes**:
- When making a rent payment, show dropdown to select rent bill
- Auto-link payment to current month's bill by default
- Show warning if no matching bill found

---

## Implementation Priority

| Priority | Task | Reason |
|----------|------|--------|
| 1 | Update Landlord Dashboard with rent stats | High visibility, immediate value |
| 2 | Update Tenant Dashboard with current bill | High visibility, immediate value |
| 3 | Create Landlord Rent Bills Index | Core functionality |
| 4 | Create Landlord Rent Bill Detail | Core functionality |
| 5 | Create Tenant Rent Bills Index | Core functionality |
| 6 | Create Tenant Rent Bill Detail | Core functionality |
| 7 | Update Landlord Sidebar | Navigation |
| 8 | Update Tenant Sidebar | Navigation |
| 9 | Payment Integration | Enhancement |

---

## Technical Notes

### API Endpoints Available

**Landlord API**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/landlord/rent-bills` | List with filtering |
| GET | `/api/v1/landlord/rent-bills/{id}` | Single with payments |
| GET | `/api/v1/landlord/rent-bills/overdue` | Overdue bills |
| GET | `/api/v1/landlord/rent-bills/pending` | Pending bills |
| POST | `/api/v1/landlord/rent-bills/{id}/waive` | Waive bill |

**Tenant API**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tenant/rent-bills` | List tenant's bills |
| GET | `/api/v1/tenant/rent-bills/current` | Current month bill |
| GET | `/api/v1/tenant/rent-bills/{id}` | Bill details |

### Status Badge Colors

| Status | Color | Description |
|--------|-------|-------------|
| `pending` | Yellow/Amber | Awaiting payment |
| `paid` | Green | Fully paid |
| `partial` | Blue | Partially paid |
| `overdue` | Red | Past due date, unpaid |
| `waived` | Gray | Forgiven/waived |

### Currency Formatting

Use existing `formatCurrency` helper:
```typescript
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);
```

---

## File Checklist

### New Files to Create

- [ ] `resources/js/pages/landlord/rent-bills/index.tsx`
- [ ] `resources/js/pages/landlord/rent-bills/show.tsx`
- [ ] `resources/js/pages/tenant/rent-bills/index.tsx`
- [ ] `resources/js/pages/tenant/rent-bills/show.tsx`

### Files to Modify

- [ ] `resources/js/pages/landlord/dashboard.tsx`
- [ ] `resources/js/pages/tenant/dashboard.tsx`
- [ ] `resources/js/components/layout/landlord-sidebar.tsx`
- [ ] `resources/js/components/layout/tenant-sidebar.tsx`
- [ ] `resources/js/pages/tenant/payments/make.tsx` (optional)

---

## Testing Checklist

- [ ] Landlord dashboard shows correct pending/overdue counts
- [ ] Landlord dashboard shows correct total outstanding amount
- [ ] Tenant dashboard shows current month's rent bill
- [ ] Landlord can view list of all rent bills
- [ ] Landlord can filter rent bills by status/property/tenant
- [ ] Landlord can view rent bill details with payment history
- [ ] Landlord can waive a rent bill
- [ ] Tenant can view their rent bills list
- [ ] Tenant can view rent bill details
- [ ] Sidebar navigation links work correctly
- [ ] Routes are properly registered

---

## Dependencies

- React 18+
- TypeScript
- Inertia.js
- shadcn/ui components
- Lucide React icons
- Ziggy.js (route generation)

---

## Estimated Effort

| Task | Estimated Time |
|------|----------------|
| Dashboard Updates | 2-4 hours |
| Landlord Rent Bills Pages | 4-6 hours |
| Tenant Rent Bills Pages | 3-4 hours |
| Navigation Updates | 1-2 hours |
| Payment Integration (Optional) | 2-3 hours |
| **Total** | **12-19 hours** |

---

*Document Version: 1.0*  
*Last Updated: 2026-03-20*  
*Related Documents: [CHANGE_ANALYSIS_REPORT.md](CHANGE_ANALYSIS_REPORT.md), [RENT_BILLING_SYSTEM.md](RENT_BILLING_SYSTEM.md)*
