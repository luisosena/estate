# Mobile Data Issues - Implementation Plan (Hybrid Approach)

## Overview
Comprehensive plan to fix mobile data flow failures, testing gaps, and API contract mismatches, utilizing a hybrid of immediate fixes and robust architectural practices.

**Estimated Duration**: 4-6 weeks  
**Priority**: Critical - Data loss affecting production users

## Decisions Log
| Question | Decision |
|----------|----------|
| Deployment strategy | Direct changes - still in development phase, no backward compatibility needed |
| Implementation order | Sequential - Complete Phase 1 fully before Phase 2 |
| Backend field name changes | Approved - change `unit_number` to `unit_code` for consistency |
| Testing framework | Jest (React Native standard, separate from Pest which is PHP-only) |
| Runtime Validation | Deferred - Rely on strict backend contract tests (Pest) and TypeScript interfaces for now, avoiding bundle bloat from Zod/Yup. |

---

## Phase 1: Critical Fixes (Week 1)

**Approach**: Complete all Phase 1 tasks sequentially before starting Phase 2.  

### 1.1 Add Mobile Testing Framework
**Goal**: Enable testing infrastructure for the mobile app

**Tasks**:
- [ ] Clean up - verify no existing test files in `mobile/src`
- [ ] Install Jest and React Native Testing Library
  ```bash
  cd mobile
  npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
  npm install --save-dev metro-react-native-babel-preset
  ```
- [ ] Configure Jest in `mobile/package.json`
- [ ] Create test setup file `mobile/src/__tests__/setup.ts`
- [ ] Add first sanity test `mobile/src/__tests__/sanity.test.ts`

### 1.2 Fix Field Name Mismatches & Data Payloads
**Goal**: Align backend and mobile data structures perfectly

**Tasks**:
- [ ] Fix `Unit` type in `mobile/src/types/index.ts`: Remove `unit_number`, keep `unit_code`.
- [ ] Fix `RentBill` type in `mobile/src/types/index.ts`: Update `unit` object to use `unit_code` instead of `unit_number`.
- [ ] Update `app/Services/TenantService.php`:
  - Modify `getTenantDashboardData()` to return the full `tenant` array/model expected by the mobile client.
  - Inject logic to retrieve and return `rent_bills` and `current_month_bill` to satisfy the `TenantDashboard` TypeScript interface, ensuring the UI has the required data.
- [ ] Fix screen references: Update `RentBillsScreen.tsx` and `RentBillDetailsScreen.tsx` to access `bill.unit.unit_code` instead of `bill.unit.unit_number`.

### 1.3 Implement Error UI in All Screens
**Goal**: Users must know when data fails to load via an elegant inline component.

**Tasks**:
- [ ] Create `ErrorState` component in `mobile/src/components/common/ErrorState.tsx`.
- [ ] Update all 16 landlord screens and 9 tenant screens with the new error handling pattern:
  - Catch API errors, log them, and set an error state.
  - Render the `<ErrorState message={error} onRetry={fetchData} />` component when `error` is present.
  - Remove silent `console.error` swallowing.

### 1.4 Resolve Landlord API Lazy Loading Violations
**Goal**: Fix 500 errors caused by `LazyLoadingViolationException` in Landlord API.

**Tasks**:
- [ ] **UtilityBillController**: Update `index` to eager-load `tenancyUtility.tenancy.tenant` and `payments.tenant`.
- [ ] **DashboardController**: Update `index` to eager-load `tenant` and `tenancy.tenant` for `recent_payments`.
- [ ] **Tenancy & Payment Models**: Audit `$appends` and ensure accessors are safe, or remove them in favor of explicit mapping.
- [ ] **Verification**: Run `UtilityBillApiTest.php` and verify dashboard endpoints.

---

## Phase 2: API Contract Layer (Week 2)

### 2.1 Standardize API Response Wrappers & Structures
**Goal**: Consistent response format across all endpoints to remove defensive client-side parsing.

**Tasks**:
- [ ] Update `app/Http/Controllers/Api/Landlord/RentBillController.php`:
  - **Standardize `index`**: Replace flat fields (`tenant_name`, `unit_number`) with nested objects (`tenant`, `unit`) containing `unit_code`.
  - **Standardize `show`**: Wrap the response object in a `data` key (`response()->json(['data' => ...])`) to match paginated endpoints.
- [ ] Remove defensive `(response as any).data || response` patterns from mobile API calls (e.g., in `RentBillDetailsScreen.tsx`).

### 2.2 Add Comprehensive API Contract Tests (Backend)
**Goal**: Ensure backend responses match expected contracts rigorously to prevent drift.

**Tasks**:
- [ ] Create `tests/Feature/Api/Contract/` directory
- [ ] Create `ApiContractTest.php` with comprehensive validation using Pest:
  - Use `assertJsonStructure` with nested schema validation (e.g., `['data' => ['*' => ['id', 'unit' => ['id', 'unit_code']]]])`.
  - Add type assertion tests using `assertJsonPath` and `whereType`.
- [ ] Update existing tests (e.g., `TenantsApiTest.php`) to use precise JSON assertions rather than just checking for a `data` key.

---

## Phase 3: Mobile Testing Suite (Weeks 3-4)

### 3.1 Unit Tests for Components
**Goal**: Test UI components in isolation

**Tasks**:
- [ ] Test `ErrorState` component
- [ ] Test `Card`, `Badge`, `Button`, `Skeleton`, and `ScreenContainer` components.

### 3.2 Screen Unit Tests with Mocked API
**Goal**: Test screen logic without network calls

**Tasks**:
- [ ] Create `mobile/src/api/__mocks__/landlord.ts`
- [ ] Test `DashboardScreen`, `TenantsScreen`, `TenantDetailsScreen`, and `RentBillsScreen` covering loading, success, error, and empty states.

### 3.3 API Layer Integration Tests
**Goal**: Test API client behavior

**Tasks**:
- [ ] Test request interceptor adds auth token
- [ ] Test 401 response clears tokens and redirects

---

## Phase 4: E2E & Network Resilience (Week 5)

### 4.1 Add Retry Logic and Network Failure Handling
**Goal**: Graceful handling of network issues

**Tasks**:
- [ ] Update `ApiClient` with exponential backoff retry logic.

### 4.2 E2E Tests with Detox
**Goal**: Full user flow testing

**Tasks**:
- [ ] Install and configure Detox.
- [ ] Create E2E tests for core flows: Login, Dashboard, Tenants List, and Rent Bills.

---

## Phase 5: Documentation & CI/CD (Week 6)

### 5.1 Documentation & CI/CD Integration
**Goal**: Maintainable testing practices and automated workflows

**Tasks**:
- [ ] Create `mobile/TESTING.md`.
- [ ] Create `docs/api-contracts.md` documenting all endpoints and field mappings.
- [ ] Add GitHub Actions workflow for mobile tests and backend API contract tests.
- [ ] Add coverage reporting.

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Mobile test coverage | 0% | 70%+ |
| API contract test coverage | ~30% | 100% |
| Screens with ErrorState | 0/25 | 25/25 |
| API response validation | Loose | Strict (Pest JSON Structure) |
| Field name mismatches | 5+ | 0 |
