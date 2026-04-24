# Mobile Data Flow Issues - Detailed Findings

**Investigation Date**: April 23, 2026  
**Scope**: Mobile application data flow, testing coverage, API contract mismatches

---

## Executive Summary

The investigation revealed **critical systemic issues** causing mobile data failures:

1. **Zero test coverage** on mobile side - no testing framework or tests exist
2. **Data structure mismatches** between backend API responses and mobile TypeScript types
3. **Silent error handling** that hides failures from users
4. **Inconsistent API response formats** across endpoints
5. **Missing API contract validation** in backend tests

---

## Critical Issues

### 1. No Mobile Testing Framework (CRITICAL)

**Location**: `mobile/package.json`

**Issue**: No testing framework installed, no test scripts defined

**Evidence**:
```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

**Impact**:
- No automated tests for mobile screens
- No regression testing
- Data flow issues can only be caught manually
- Zero test coverage (0%)

**Severity**: CRITICAL - Prevents detection of data flow bugs

---

### 2. Field Name Mismatches (HIGH)

#### 2.1 Unit Field Naming Inconsistency

**Backend Model** (`app/Models/Unit.php`):
```php
protected $fillable = [
    'property_id',
    'unit_code',    // Backend uses unit_code
    'unit_name',    // Backend uses unit_name
    'status',
];
```

**Mobile Type** (`mobile/src/types/index.ts:52-66`):
```typescript
export interface Unit {
  id: number;
  unit_number: string;  // WRONG - doesn't exist in backend
  unit_name: string;
  property_id?: number;
  status?: 'occupied' | 'vacant' | 'maintenance' | 'available';
  // ...
}
```

**Backend API Response** (`app/Http/Controllers/Api/Landlord/RentBillController.php:70`):
```php
'unit_number' => $bill->tenancy?->unit?->unit_code,  // Maps unit_code → unit_number
```

**Mobile Screen Usage** (`mobile/src/screens/landlord/RentBillsScreen.tsx:196`):
```typescript
{bill.unit ? ` · Unit ${bill.unit.unit_number}` : ''}  // Expects unit.unit_number
```

**Impact**:
- Mobile expects `unit_number` but backend sometimes returns `unit_code`
- Inconsistent mapping causes data display failures
- Type mismatches lead to runtime errors

**Severity**: HIGH - Direct data failure

---

#### 2.2 RentBill Type Mismatch

**Mobile Type** (`mobile/src/types/index.ts:149-168`):
```typescript
export interface RentBill {
  id: number;
  // ...
  unit?: {
    id: number;
    unit_number: string;  // WRONG - should be unit_code
    unit_name: string;
  };
}
```

**Backend Response** (`RentBillController.php:70, 126`):
```php
'unit_code' => $bill->tenancy?->unit?->unit_code,  // Returns unit_code
```

**Impact**:
- Mobile screens accessing `bill.unit.unit_number` get undefined
- Unit information not displayed in rent bills

**Severity**: HIGH - Data not displayed to users

---

#### 2.3 TenantDashboard Type Mismatch

**Mobile Type** (`mobile/src/types/index.ts:271-281`):
```typescript
export interface TenantDashboard {
  tenant: Tenant;  // Expects full Tenant model
  unit: Unit | null;
  tenancy: Tenancy | null;
  payments: Payment[];
  utilities: Utility[];
  notifications: Notification[];
  rent_bills?: RentBill[];      // Optional - may not exist
  current_month_bill?: RentBill | null;
}
```

**Backend Response** (`app/Services/TenantService.php:16-50`):
```php
return [
    'tenant' => [  // Array, not full Tenant model
        'id' => $tenant->id,
        'full_name' => $tenant->full_name,
        'phone' => $tenant->phone,
        'email' => $tenant->email,
        'tenant_code' => $tenant->tenant_code,
        'emergency_contact_name' => $tenant->emergency_contact_name,
        'emergency_contact_phone' => $tenant->emergency_contact_phone,
    ],
    'unit' => $activeTenancy?->unit,  // Full Unit model
    'tenancy' => [  // Array with limited fields
        'id' => $activeTenancy->id,
        'move_in_date' => $activeTenancy->move_in_date,
        'status' => $activeTenancy->status,
        'monthly_rent' => $activeTenancy->monthly_rent,
        'security_deposit' => $activeTenancy->security_deposit,
    ] : null,
    'payments' => $activeTenancy?->payments->sortByDesc(...)->take(5)->values() ?? [],
    'utilities' => $activeTenancy?->tenancyUtilities,
    'notifications' => $tenant->notifications()->latest()->take(5)->get(),
    // NO rent_bills or current_month_bill fields
];
```

**Impact**:
- Mobile expects full `Tenant` model but gets array
- Mobile expects `rent_bills` and `current_month_bill` but backend doesn't provide them
- Type mismatch causes silent failures

**Severity**: HIGH - Incomplete data displayed

---

### 3. Silent Error Handling (HIGH)

**Pattern Found in All Screens**:

**Example** (`mobile/src/screens/landlord/DashboardScreen.tsx:49-65`):
```typescript
const fetchDashboard = useCallback(async () => {
  try {
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 200));
    const data = await landlordApi.getDashboard();
    setDashboardData(data);
  } catch (err) {
    console.error('Failed to fetch dashboard:', err);
    // NO user notification - just console.error
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);
```

**Example** (`mobile/src/screens/landlord/TenantsScreen.tsx:45-60`):
```typescript
const fetchTenants = useCallback(async () => {
  try {
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 200));
    const data = await landlordApi.getTenants();
    setTenants(data.data);
  } catch (err) {
    console.error('Failed to fetch tenants:', err);
    // NO user notification
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);
```

**Affected Screens** (25 total):
- 16 landlord screens
- 9 tenant screens

**Impact**:
- Users see infinite loading spinner on API failure
- No indication that data failed to load
- No retry mechanism
- Debugging difficult (only console logs)

**Severity**: HIGH - Poor user experience, invisible failures

---

### 4. Inconsistent API Response Wrappers (MEDIUM)

**Inconsistency Examples**:

**Wrapped Response** (`RentBillController@index`):
```php
return response()->json([
    'data' => $bills,
    'meta' => [...],
]);
```

**Unwrapped Response** (`RentBillController@show`):
```php
return response()->json($rentBill);  // Direct object, no { data: ... }
```

**Mobile Defensive Code** (`mobile/src/screens/landlord/RentBillDetailsScreen.tsx:56-58`):
```typescript
const response = await landlordApi.getRentBill(billId);
// Backend consistency check: handles both { data: RentBill } and direct RentBill responses
const billData = (response as any).data || response;  // Defensive hack
setBill(billData);
```

**Impact**:
- Mobile needs defensive code to handle inconsistency
- Type safety compromised with `as any`
- Unclear API contract

**Severity**: MEDIUM - Type safety compromised

---

### 5. Missing API Contract Validation (MEDIUM)

**Current Backend Tests** (`tests/Feature/Api/Landlord/TenantsApiTest.php:27-30`):
```php
test('landlord can list own tenants', function () {
    $this->getJson('/api/landlord/tenants')
        ->assertOk()
        ->assertJsonStructure(['data']);  // Only checks 'data' exists, not its contents!
});
```

**Missing Validation**:
- No field name validation
- No type checking (string vs number)
- No nested structure validation
- No null handling scenarios

**Impact**:
- Backend can change response structure without test failure
- Mobile types can drift from backend reality
- No guarantee of API contract stability

**Severity**: MEDIUM - Contract drift risk

---

## Backend Test Coverage Gaps

### Existing Test Files
- `tests/Feature/Api/ApiAuthTest.php` - Basic auth tests
- `tests/Feature/Api/Landlord/DashboardApiTest.php` - Basic dashboard test
- `tests/Feature/Api/Landlord/TenantsApiTest.php` - Basic tenant CRUD
- `tests/Feature/Api/Landlord/RentBillsApiTest.php` - Basic rent bill tests
- `tests/Feature/Api/Landlord/UnitsApiTest.php` - Basic unit CRUD

### What's Missing
- Field-level validation (exact field names)
- Type assertion tests (is this a string or number?)
- Nested object structure validation
- Response wrapper consistency tests
- Null/empty data handling tests
- Edge case tests (empty lists, missing relations)

---

## Mobile Screen Data Flow Issues

### Data Fetching Pattern Issues

**All screens follow this pattern**:
1. Set loading state
2. Add 200ms artificial delay
3. Call API
4. On success: set data
5. On error: console.error only
6. Finally: clear loading state

**Problems**:
- 200ms delay unnecessary for production
- No error state UI
- No retry logic
- No network failure handling

### Specific Screen Issues

#### DashboardScreen
- No error handling for `getDashboard()` failure
- Type mismatch: expects `LandlordDashboard` but backend may return different structure

#### TenantsScreen
- No error handling for `getTenants()` failure
- Pagination not tested

#### TenantDetailsScreen
- Uses `tenantCode` but API may expect different identifier
- Type mismatch with `TenantDashboard`

#### RentBillsScreen
- Uses `unit.unit_number` which doesn't exist in backend
- Filter logic not tested

#### RentBillDetailsScreen
- Defensive code for response wrapping inconsistency
- Uses `unit.unit_number` incorrectly

---

## API Client Issues

### Current Implementation (`mobile/src/api/client.ts`)

**Request Interceptor**:
```typescript
this.client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

**Response Interceptor**:
```typescript
this.client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await this.clearTokens();
    }
    return Promise.reject(error);
  }
);
```

**Issues**:
- No retry logic for failed requests
- No timeout handling (30s timeout but no exponential backoff)
- No request logging for debugging
- No response validation
- 401 clears tokens but doesn't redirect to login

---

## Type Definition Issues

### Missing Runtime Validation

**Current State**:
- TypeScript interfaces provide compile-time type checking
- No runtime validation of API responses
- Mismatches only caught at runtime when accessing undefined fields

**Impact**:
- Backend changes can break mobile without compile errors
- Silent failures when accessing undefined fields
- Difficult to debug type mismatches

---

## Summary of Issues by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 1 | No mobile testing framework |
| HIGH | 4 | Field name mismatches, Silent error handling, TenantDashboard type mismatch, RentBill type mismatch |
| MEDIUM | 3 | Inconsistent API responses, Missing contract validation, Type definition issues |
| LOW | 0 | - |

---

## Files Requiring Changes

### Mobile Type Definitions
- `mobile/src/types/index.ts` - Fix Unit, RentBill, TenantDashboard types

### Mobile Screens (25 total)
- `mobile/src/screens/landlord/DashboardScreen.tsx`
- `mobile/src/screens/landlord/PropertiesScreen.tsx`
- `mobile/src/screens/landlord/PropertyDetailsScreen.tsx`
- `mobile/src/screens/landlord/UnitsScreen.tsx` (if exists)
- `mobile/src/screens/landlord/UnitDetailsScreen.tsx`
- `mobile/src/screens/landlord/TenantsScreen.tsx`
- `mobile/src/screens/landlord/TenantDetailsScreen.tsx`
- `mobile/src/screens/landlord/PaymentsScreen.tsx`
- `mobile/src/screens/landlord/RentBillsScreen.tsx`
- `mobile/src/screens/landlord/RentBillDetailsScreen.tsx`
- `mobile/src/screens/landlord/UtilityBillsScreen.tsx`
- `mobile/src/screens/landlord/TenancyUtilitiesScreen.tsx`
- `mobile/src/screens/landlord/AddPropertyScreen.tsx`
- `mobile/src/screens/landlord/AddUnitScreen.tsx`
- `mobile/src/screens/landlord/AddTenantScreen.tsx`
- `mobile/src/screens/landlord/ProfileScreen.tsx`
- `mobile/src/screens/landlord/EditProfileScreen.tsx`
- `mobile/src/screens/tenant/*` (9 screens)

### API Layer
- `mobile/src/api/landlord.ts` - Response type inconsistencies
- `mobile/src/api/client.ts` - Add retry logic, logging, validation

### Backend Controllers
- `app/Http/Controllers/Api/Landlord/RentBillController.php` - Fix field names, standardize responses
- `app/Http/Controllers/Api/Landlord/DashboardController.php` - Verify response structure
- `app/Http/Controllers/Api/Landlord/TenantController.php` - Verify response structure

### Backend Tests
- `tests/Feature/Api/Landlord/*` - Add field-level validation
- `tests/Feature/Api/Contract/*` - Create new contract test directory

---

## Root Cause Analysis

**Primary Root Cause**: Lack of mobile testing infrastructure

Without automated tests:
- Type mismatches go undetected
- API contract changes break mobile silently
- Error handling issues persist
- Regression testing impossible

**Secondary Root Causes**:
1. Manual type synchronization between backend and mobile
2. No API contract validation layer
3. Inconsistent error handling patterns
4. No runtime response validation

---

## Recommended Fix Order

1. **Immediate**: Add mobile testing framework (Jest)
2. **Immediate**: Fix field name mismatches (unit_number → unit_code)
3. **Immediate**: Add error UI to all screens
4. **Short-term**: Add API contract tests (backend)
5. **Short-term**: Implement runtime validation (Zod/Yup)
6. **Medium-term**: Add mobile component and screen tests
7. **Long-term**: Add E2E tests with Detox

---

## Related Documents

- Implementation Plan: `docs/plans/mobile-data-issues-implementation-plan.md`
- API Field Mappings: `docs/api-field-mappings.md` (to be created)
- API Contracts: `docs/api-contracts.md` (to be created)
