# Mobile App - Rent Billing System Implementation Plan

## Overview

This document outlines the implementation plan to modify the mobile app (`mobile/`) to align with the backend changes that implement a complete **Rent Billing System**. The backend changes include:

- New `RentBill` model with automatic monthly generation
- Rent bill management (view, filter, waive)
- Rent bill statistics in dashboard responses
- Payment integration with rent bills
- Scheduled commands for rent bill generation and overdue marking

---

## Phase 1: Type Definitions

### 1.1 Add RentBill Types

**File:** `mobile/src/types/index.ts`

Add the following types to support rent billing:

```typescript
// Rent Bill Status
export type RentBillStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'waived';

// Rent Bill
export interface RentBill {
  id: number;
  tenancy_id: number;
  billing_month: string;        // YYYY-MM-01
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: RentBillStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  // Relationships (populated from API)
  tenant?: {
    id: number;
    full_name: string;
    email: string;
  };
  unit?: {
    id: number;
    unit_number: string;
  };
  property?: {
    id: number;
    name: string;
  };
  payments?: Payment[];
}

// Rent Bill Summary (for dashboard)
export interface RentBillSummary {
  total_outstanding: number;
  pending_count: number;
  overdue_count: number;
  paid_count: number;
}

// Landlord Dashboard Enhancement
export interface LandlordDashboard {
  // ... existing fields
  pending_rent_bills: number;
  overdue_rent_bills: number;
  total_rent_outstanding: number;
  recent_rent_bills?: RentBill[];  // Optional: recent rent bills
}

// Tenant Dashboard Enhancement  
export interface TenantDashboard {
  // ... existing fields
  rent_bills: RentBill[];
  current_month_bill: RentBill | null;
}
```

---

## Phase 2: API Integration

### 2.1 Update Landlord API

**File:** `mobile/src/api/landlord.ts`

Add the following methods to `landlordApi`:

```typescript
// Rent Bills
getRentBills: (params?: {
  page?: number;
  status?: string;
  property_id?: number;
  tenant_id?: number;
}): Promise<{
  data: RentBill[];
  meta: { current_page: number; per_page: number; total: number; total_pages: number };
}>,

getRentBill: (rentBillId: number): Promise<{ data: RentBill }>,

waiveRentBill: (rentBillId: number): Promise<{ message: string; data: RentBill }>,

getOverdueRentBills: (): Promise<{ data: RentBill[] }>,

getPendingRentBills: (): Promise<{ data: RentBill[] }>,
```

### 2.2 Update Tenant API

**File:** `mobile/src/api/tenant.ts`

Add the following methods to `tenantApi`:

```typescript
// Rent Bills
getRentBills: (): Promise<{
  data: RentBill[];
  summary: RentBillSummary;
}>,

getCurrentMonthRentBill: (): Promise<{ data: RentBill | null }>,

getRentBill: (rentBillId: number): Promise<{ data: RentBill }>,
```

### 2.3 Update PaymentFormData

**File:** `mobile/src/api/tenant.ts`

Update the `PaymentFormData` interface to include optional `rent_bill_id`:

```typescript
export interface PaymentFormData {
  amount: number;
  payment_type: 'rent' | 'utility';
  payment_method: 'mobile_money' | 'bank_transfer';
  utility_bill_id?: number;
  rent_bill_id?: number;  // NEW: link payment to specific rent bill
  reference_number?: string;
  notes?: string;
}
```

---

## Phase 3: Navigation Updates

### 3.1 Tenant Navigation

**File:** `mobile/src/navigation/AppNavigator.tsx`

Add new stack navigator for rent bills:

```typescript
export type TenantPaymentsStackParamList = {
  PaymentsList: undefined;
  MakePayment: { monthlyRent?: number; pendingAmount?: number; rentBillId?: number };
  RentBills: undefined;           // NEW: View all rent bills
  RentBillDetails: { billId: number };  // NEW: View specific rent bill
};
```

### 3.2 Landlord Navigation

**File:** `mobile/src/navigation/AppNavigator.tsx`

Update the Payments stack:

```typescript
export type LandlordPaymentsStackParamList = {
  PaymentsList: undefined;
  UtilityBills: undefined;
  RentBills: undefined;           // NEW: Manage rent bills
  RentBillDetails: { billId: number };  // NEW: View/edit rent bill
};
```

---

## Phase 4: Dashboard Updates

### 4.1 Landlord Dashboard

**File:** `mobile/src/screens/landlord/DashboardScreen.tsx`

Add to the Overview card:
- Display `pending_rent_bills` count
- Display `overdue_rent_bills` count  
- Display `total_rent_outstanding` amount

Add new "Rent Bills" section showing:
- Overdue rent bills count with warning styling
- Quick link to manage rent bills

### 4.2 Tenant Dashboard

**File:** `mobile/src/screens/tenant/DashboardScreen.tsx`

Enhance the dashboard:
- Display current month rent bill status prominently
- Show outstanding rent amount with color coding
- Add quick "Pay Rent" button linking to payment

Update the "Recent Payments" section to show rent bills separately from utility payments.

---

## Phase 5: New Screens

### 5.1 Tenant Rent Bills Screen

**New File:** `mobile/src/screens/tenant/RentBillsScreen.tsx`

Create a new screen similar to utility bills but for rent:

**Features:**
- List all rent bills (past and current)
- Show status badges (pending, paid, partial, overdue, waived)
- Display billing month, amount due, amount paid, due date
- Quick action: "Pay Now" button for pending/overdue bills
- Navigation to bill details

**Design Pattern:** Follow `LandlordUtilityBillsScreen.tsx` structure

### 5.2 Tenant Rent Bill Details Screen

**New File:** `mobile/src/screens/tenant/RentBillDetailsScreen.tsx`

**Features:**
- Display full rent bill information
- Show payment history for this bill
- Action buttons: "Make Payment", "View Unit Details"

### 5.3 Landlord Rent Bills Screen

**New File:** `mobile/src/screens/landlord/RentBillsScreen.tsx`

**Features:**
- List all rent bills with filtering (status, property, tenant)
- Show summary stats (total outstanding, pending, overdue)
- Quick actions: View details, Waive bill
- Pagination support

**Design Pattern:** Follow `LandlordUtilityBillsScreen.tsx` structure

### 5.4 Landlord Rent Bill Details Screen

**New File:** `mobile/src/screens/landlord/RentBillDetailsScreen.tsx`

**Features:**
- Display full rent bill with tenant, unit, property info
- Show payment history for this bill
- Actions: Waive bill (for unpaid bills)

---

## Phase 6: Payment Flow Updates

### 6.1 Make Payment Screen Enhancement

**File:** `mobile/src/screens/tenant/MakePaymentScreen.tsx`

When payment type is "rent":
- Fetch and display pending rent bills (similar to utility bill selection)
- Allow user to select which rent bill to pay
- Auto-populate amount from selected bill's outstanding balance
- Include `rent_bill_id` in payment submission

**Implementation:**
```typescript
// Add state for rent bills
const [rentBills, setRentBills] = useState<RentBill[]>([]);

// Fetch rent bills when payment type changes to rent
useEffect(() => {
  if (paymentType === 'rent') {
    // Fetch pending rent bills
    tenantApi.getRentBills().then(response => {
      const pending = response.data.filter(
        bill => bill.status === 'pending' || bill.status === 'partial' || bill.status === 'overdue'
      );
      setRentBills(pending);
    });
  } else {
    setRentBills([]);
  }
}, [paymentType]);

// Include rent_bill_id in submission
const paymentData: PaymentFormData = {
  amount: parseFloat(amount),
  payment_type: paymentType,
  payment_method: paymentMethod,
  utility_bill_id: paymentType === 'utility' ? selectedBillId : undefined,
  rent_bill_id: paymentType === 'rent' ? selectedRentBillId : undefined,
  // ... other fields
};
```

### 6.2 Payments Screen Updates

**File:** `mobile/src/screens/tenant/PaymentsScreen.tsx`

- Display rent bills summary at top (outstanding amount, current month bill)
- Link to new "Rent Bills" screen
- Update payment history to show associated rent bills

---

## Phase 7: Landlord Payments Screen Updates

### 7.1 Add Rent Bills Button

**File:** `mobile/src/screens/landlord/PaymentsScreen.tsx`

Add a button to navigate to rent bills management (similar to utility bills):

```typescript
<Button
  mode="contained"
  onPress={() => navigation.navigate('RentBills')}
  style={{ marginHorizontal: 16, marginBottom: 16 }}
  icon="file-document"
>
  Manage Rent Bills
</Button>
```

---

## Phase 8: Integration Checklist

### 8.1 Files to Create

| File | Description |
|------|-------------|
| `mobile/src/screens/tenant/RentBillsScreen.tsx` | Tenant rent bills list |
| `mobile/src/screens/tenant/RentBillDetailsScreen.tsx` | Tenant rent bill details |
| `mobile/src/screens/landlord/RentBillsScreen.tsx` | Landlord rent bills management |
| `mobile/src/screens/landlord/RentBillDetailsScreen.tsx` | Landlord rent bill details |

### 8.2 Files to Modify

| File | Modifications |
|------|---------------|
| `mobile/src/types/index.ts` | Add RentBill, RentBillSummary types |
| `mobile/src/api/landlord.ts` | Add rent bill API methods |
| `mobile/src/api/tenant.ts` | Add rent bill API methods and update PaymentFormData |
| `mobile/src/navigation/AppNavigator.tsx` | Add new navigation routes |
| `mobile/src/screens/landlord/DashboardScreen.tsx` | Display rent bill stats |
| `mobile/src/screens/tenant/DashboardScreen.tsx` | Display current rent bill |
| `mobile/src/screens/landlord/PaymentsScreen.tsx` | Add rent bills navigation |
| `mobile/src/screens/tenant/PaymentsScreen.tsx` | Add rent bills link |
| `mobile/src/screens/tenant/MakePaymentScreen.tsx` | Rent bill selection |

---

## Implementation Priority

1. **Phase 1-2:** Type definitions and API integration (Foundational)
2. **Phase 3:** Navigation setup
3. **Phase 4:** Dashboard updates (Visible immediately)
4. **Phase 5:** New screens (Core feature)
5. **Phase 6-7:** Payment flow and existing screen updates
6. **Phase 8:** Integration testing

---

## API Endpoints to Consume

### Landlord Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/landlord/rent-bills` | List all rent bills |
| GET | `/api/v1/landlord/rent-bills/{id}` | Get rent bill details |
| GET | `/api/v1/landlord/rent-bills/overdue` | List overdue bills |
| GET | `/api/v1/landlord/rent-bills/pending` | List pending bills |
| POST | `/api/v1/landlord/rent-bills/{id}/waive` | Waive a rent bill |

### Tenant Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/tenant/rent-bills` | List tenant's rent bills |
| GET | `/api/v1/tenant/rent-bills/current` | Get current month's bill |
| GET | `/api/v1/tenant/rent-bills/{id}` | Get rent bill details |

### Dashboard Enhancement

| User | Response Field | Description |
|------|----------------|-------------|
| Landlord | `pending_rent_bills` | Count of pending rent bills |
| Landlord | `overdue_rent_bills` | Count of overdue rent bills |
| Landlord | `total_rent_outstanding` | Total outstanding amount |
| Tenant | `rent_bills` | Array of rent bills |
| Tenant | `current_month_bill` | Current month's bill details |

---

## Notes

- The mobile app already uses a similar pattern for utility bills, so follow the same structure for consistency
- Rent bills are auto-generated by the backend on the 1st of each month via the `rent-bills:generate-monthly` command
- Payments can now be linked to specific rent bills via `rent_bill_id`
- The backend automatically handles linking payments to the current month's rent bill if no specific bill is selected
