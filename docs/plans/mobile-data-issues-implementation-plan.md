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
| Runtime Validation | Deferred - Rely on strict backend contract tests (Pest) and TypeScript interfaces for now. |
| **Response Wrapping** | **Standardized**: All single-resource responses must be wrapped in `data`. Paginated responses must use `data` and `meta` for pagination metadata. |
| **Data Flattening** | **Standardized**: Relationships must be flattened into the root of the `data` object to simplify mobile hydration. |

---

## Phase 1: Critical Fixes (COMPLETED)

**Approach**: Stabilize the environment and UI before deep refactoring.

### 1.1 Add Mobile Testing Framework
**Goal**: Enable testing infrastructure for the mobile app
- [x] Clean up - verify no existing test files in `mobile/src`
- [x] Install Jest and React Native Testing Library
- [x] Configure Jest in `mobile/package.json`
- [x] Create test setup file `mobile/src/__tests__/setup.ts`
- [x] Add first sanity test `mobile/src/__tests__/sanity.test.ts`

### 1.2 Fix Field Name Mismatches & Data Payloads (Pilot)
**Goal**: Align backend and mobile data structures perfectly
- [x] Fix `Unit` type in `mobile/src/types/index.ts`: Remove `unit_number`, keep `unit_code`.
- [x] Fix `RentBill` type in `mobile/src/types/index.ts`: Update `unit` object to use `unit_code` instead of `unit_number`.
- [x] Update `app/Services/TenantService.php`: Return full tenant array and rent bills.
- [x] Fix screen references: Update `RentBillsScreen.tsx` and `RentBillDetailsScreen.tsx` for `unit_code`.

### 1.3 Implement Error UI in All Screens
**Goal**: Users must know when data fails to load via an elegant inline component.
- [x] Create `ErrorState` component in `mobile/src/components/common/ErrorState.tsx`.
- [x] Update all 16 landlord screens and 9 tenant screens with the new error handling pattern.
- [x] Standardize error handling: `Alert.alert` for mutations, `ErrorState` for data fetching.

### 1.4 Resolve Landlord API Lazy Loading Violations (Initial)
**Goal**: Fix 500 errors caused by `LazyLoadingViolationException` in Landlord API.
- [x] **DashboardController**: Update `index` to eager-load `tenant` and `tenancy.tenant` for `recent_payments`.
- [ ] **UtilityBillController**: Update `index` to eager-load `tenancyUtility.tenancy.tenant` and `payments.tenant`.

---

## Phase 2: API Contract Standardization (IN PROGRESS)

### 2.1 Standardize API Response Wrappers & Structures
**Goal**: Consistent response format across all endpoints to remove defensive client-side parsing.

**Tasks (Pilot - COMPLETED)**:
- [x] Standardize `RentBillController.php` (Landlord): Return nested `tenant` and `unit` (with `unit_code`).
- [x] Standardize `DashboardController.php` (Tenant/Landlord): Add root `data` wrapper.

**Tasks (Scale-up - PENDING)**:
- [ ] **Paginated Meta Migration**: Update all paginated endpoints to return `{ data: [...], meta: { current_page, ... } }`.
- [ ] **Utility Standardization**:
    - Refactor `UtilityBillController` to enforce strict nested `tenancy_utility.tenancy.unit` and `tenant` structures, REMOVING ALL flattened shortcuts (`utility_type_name`, `unit_code`, `property_name`, `tenant_name`).
    - Update `UtilityBill` and `Utility` interfaces in `mobile/src/types/index.ts` to expect nested objects.
- [ ] **Property & Unit Standardization**: Enforce nested `property` and `unit` objects inside tenancies/bills, avoiding flattened `property_name` or `unit_code`.
- [ ] Remove defensive `(response as any).data || response` patterns from remaining mobile screens.

### 2.2 Add Comprehensive API Contract Tests (Backend)
**Goal**: Ensure backend responses match expected contracts rigorously to prevent drift.
- [x] Create `tests/Feature/Api/Landlord/RentBillApiTest.php` with `assertJsonStructure`.
- [x] Create `tests/Feature/Api/Tenant/DashboardApiTest.php` with `assertJsonStructure`.
- [ ] **Scale Audit**: Create Pest contract tests for ALL refactored endpoints (Properties, Units, Utilities).

---

## Phase 3: Mobile Testing Suite (Weeks 3-4)

### 3.1 Unit Tests for Components
**Goal**: Test UI components in isolation
- [/] Test `ErrorState` component (Initial test added).
- [ ] Test `Card`, `Badge`, `Button`, `Skeleton`, and `ScreenContainer`.

### 3.2 Screen Unit Tests with Mocked API
**Goal**: Test screen logic without network calls
- [ ] Create `mobile/src/api/__mocks__/landlord.ts`.
- [ ] Test `DashboardScreen` and `TenantsScreen` covering all states (Loading, Success, Error).

---

## Phase 4: E2E & Network Resilience (Week 5)

### 4.1 Add Retry Logic and Network Failure Handling
**Goal**: Graceful handling of network issues
- [x] Update `client.ts` with `axios-retry` for exponential backoff (3 retries).

### 4.2 E2E Tests with Detox
**Goal**: Full user flow testing
- [ ] Install and configure Detox.
- [ ] Create E2E tests for core flows: Login, Dashboard, Rent Bills.

---

## Phase 5: Documentation & CI/CD (Week 6)

### 5.1 Documentation & CI/CD Integration
**Goal**: Maintainable testing practices and automated workflows
- [x] Synchronize `docs/projectsummary/` (API_REFERENCE, ARCHITECTURE, etc.).
- [ ] Create `docs/api-contracts.md` (Optional - covered by API_REFERENCE).
- [ ] Add GitHub Actions workflow for mobile tests and backend API contract tests.

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Mobile test coverage | ~5% | 70%+ |
| API contract test coverage | ~40% | 100% |
| Screens with ErrorState | 25/25 | 25/25 |
| API response validation | Mixed | Strict (Pest JSON Structure) |
| Field name mismatches | 2 (Utilities/Units) | 0 |
