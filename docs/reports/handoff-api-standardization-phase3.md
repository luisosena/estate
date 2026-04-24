# Hand-off: API Standardization & Mobile Testing (Phase 3)

## 1. Project Context
**Objective**: Standardize the Estate Practice API to prevent mobile runtime crashes and implement a robust testing suite.
**Strategy**: **Contract-First Alignment**. The Backend (Pest) enforces the JSON structure, which is mirrored in Frontend (TypeScript) and validated in consumption (Jest).

---

## 2. Current Status (End of Phase 2)

### ✅ Completed
- **API Standardization**: Properties, Units, Utilities, and Profiles are now standardized.
    - Responses are wrapped in `{"data": ...}`.
    - Relationships are flattened (e.g., `property_name` in Unit root).
    - Metadata is isolated in `{"meta": ...}`.
- **Contract Enforcement**: 4 new Pest feature tests strictly validate these structures using `assertJsonStructure`.
- **Mobile Compatibility**:
    - `mobile/src/api/landlord.ts` and `tenant.ts` updated to internally handle `.data` extraction.
    - `mobile/src/types/index.ts` updated with flattened fields and `PaginatedResponse` metadata.
- **Documentation**: Detailed logic recorded in `docs/reports/api-contract-and-standardization.md`.

### ⚠️ In Progress / Pending (Phase 2 Leftovers)
- **Eager Loading**: `UtilityBillController@index` (Landlord) needs relationship optimization to prevent `LazyLoadingViolationException`.
- **Defensive Cleanup**: Some mobile screens might still have legacy `(response as any).data` patterns that can now be cleaned up.

---

## 3. The "Next Step" Road Map (Phase 3)

The goal is to complete **Phase 3: Mobile Testing Suite** before concluding this implementation plan.

### Step 1: Backend Polish
- Update `UtilityBillController` to eager-load `tenancyUtility.tenancy.tenant` and `payments.tenant`.
- Run the full API suite: `php artisan test tests/Feature/Api`.

### Step 2: Component Testing (Jest)
- Test UI components (`Card`, `Badge`, `Button`, `Skeleton`) in isolation using `@testing-library/react-native`.
- Verify the `ErrorState` component correctly handles retry callbacks.

### Step 3: Screen Integration Testing
- **Create Mocks**: Implement `mobile/src/api/__mocks__/landlord.ts` and `tenant.ts` using JSON samples from the Pest test outputs.
- **Dashboard Validation**: Test `DashboardScreen.tsx` to ensure it renders stats from the new `data` object correctly.
- **Properties Validation**: Test `PropertiesScreen.tsx` to ensure it displays flattened fields (like `property_name`) without crashing.

---

## 4. Critical Files & References

### Backend (Contracts)
- **Tests**: `tests/Feature/Api/` (The Source of Truth)
- **Controllers**: `app/Http/Controllers/Api/Landlord/` & `Tenant/`

### Mobile (Implementation)
- **Types**: `mobile/src/types/index.ts` (The Structural Bridge)
- **API Client**: `mobile/src/api/client.ts` (Base axios wrapper)
- **Services**: `mobile/src/api/landlord.ts` & `tenant.ts` (Compatibility bridge)

### Documentation
- **Strategy Detail**: `docs/reports/api-contract-and-standardization.md`
- **Implementation Plan**: `docs/plans/mobile-data-issues-implementation-plan.md`

---

## 5. Instructions for the New Agent
1.  **Read the Plan**: Review `docs/plans/mobile-data-issues-implementation-plan.md` to understand the full scope.
2.  **Verify the Contract**: Run `php artisan test tests/Feature/Api` to see the current enforced schema.
3.  **Start Mocking**: Begin Phase 3 by creating the API mocks in the `mobile` project.
4.  **Avoid Breaking UI**: When updating API services, always return the structure the UI expects (e.g., extracting `.data` internally) to avoid a massive component refactor.
