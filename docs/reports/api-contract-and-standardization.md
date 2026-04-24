# API Contract & Standardization Report

## Executive Summary
This report documents the systematic refactoring of the Estate Practice API to eliminate runtime crashes on the mobile client. The core solution involves implementing a **Contract-First Alignment Strategy** that standardizes data delivery through root-level wrapping, relationship flattening, and a multi-layered validation loop between the backend (Pest) and frontend (TypeScript/Jest).

---

## 1. The New Standard Contract
To prevent `TypeError` and "undefined" crashes (e.g., `cannot read property 'name' of undefined`), all API responses now adhere to the following rigid schema rules:

### A. Root Level Wrapping
Every successful resource response must be wrapped in a `data` key. 
- **Single Resource**: `{"data": { ... }}`
- **Collections (Paginated)**: `{"data": [...], "meta": { ... }}`

### B. Data Flattening (Anti-Crash Strategy)
Deeply nested relationship structures are flattened into the root of the `data` object. This ensures that the mobile client can access related information without traversing potentially null objects.

#### The "TypeError" Prevention Logic:
```typescript
// ❌ LEGACY (Dangerous)
// If 'property' was missing from the response, this line threw:
// "TypeError: Cannot read property 'name' of undefined"
const name = response.unit.property.name; 

// ✅ STANDARD (Safe)
// The field is guaranteed to exist as a string or null at the root.
// No deep traversal required.
const name = response.data.property_name;
```

### C. Metadata Isolation
Non-resource metadata (statistics, summaries, tenancy info) is strictly isolated within a `meta` object. This prevents pollution of the primary resource array and provides a consistent location for secondary information.

---

## 2. The Interaction Logic: Contract-First Alignment
Although the systems run in different environments (PHP vs. Node.js), they are synchronized through the **API Schema Enforcement** cycle.

### Phase 1: Pest as the "Source of Truth" (Backend Enforcement)
The Pest tests (e.g., `PropertyApiTest.php`, `UnitApiTest.php`) act as the strict **Contract Definition**.
- **Enforcement**: By using `assertJsonStructure(['data' => [...]])`, Pest ensures that the backend *cannot* change the response format (like removing the `data` wrapper or un-flattening a field) without breaking the build.
- **Guarantee**: This provides a guaranteed "Shape" that the mobile client can rely on.

### Phase 2: TypeScript as the "Structural Bridge"
The interfaces in `mobile/src/types/index.ts` are mapped directly to the JSON structures validated by Pest.
- **Compile-time Validation**: When the backend returns `property_name` (flattened), the `Unit` interface is updated in TypeScript.
- **Impact**: If a developer changes a field in the backend and updates the Pest test, they *must* update the TypeScript interface. Failure to do so causes immediate compiler errors or IDE red-squiggles, flagging the mismatch before the code even runs.

### Phase 3: Jest Mocking & Integration
In the mobile test suite, Jest tests use Mocks that mimic the API responses.
- **Mock Realism**: To ensure Jest tests are valid, mocks are built using the exact JSON samples provided by the Pest test outputs.
- **Validation**: If a Jest test passes with a mock but fails when hitting the real API, it indicates the mock is out of sync with the Pest contract.

---

## 3. The Direct Validation Loop
The standardized workflow for adding or changing API data follows this loop:

1.  **Define in Pest**: "I need units to have a `property_name` field."
2.  **Enforce in Pest**: Add `assertJsonStructure(['data' => [['property_name']]])`.
3.  **Align in TS**: Update `interface Unit { property_name: string; }`.
4.  **Test in Jest**: Create a mock unit with `property_name` and ensure the UI renders it.

---

## 4. Summary of the Interaction

| Layer | Tool | Role |
| :--- | :--- | :--- |
| **Backend** | Pest | **Enforcement**: Guarantees the JSON structure matches the contract. |
| **API Layer** | TypeScript | **Alignment**: Ensures the code knows about the structure enforced by Pest. |
| **Mobile** | Jest | **Consumption**: Validates that the app handles the "Pest-approved" data correctly. |

---

## 5. Implementation Status & Improvements

| Module | Standardized | Contract Tests | Key Improvements & Meta Structure |
| :--- | :---: | :--- | :--- |
| **Properties** | ✅ | `PropertyApiTest.php` | `meta`: Contains `total_units`, `occupied_units`, `vacant_units` stats. |
| **Units** | ✅ | `UnitApiTest.php` | Flattened `property_name`, `property_address` into unit root. |
| **Utilities** | ✅ | `UtilityApiTest.php` | `meta`: Contains `total_due`, `total_paid` summary for Tenant view. |
| **Profiles** | ✅ | `ProfileApiTest.php` | `data`: Wraps User and nested `tenant` info securely. |

---

## 6. Technical Reference

### Key Artisan Commands
- **Run all API tests**: `php artisan test tests/Feature/Api --compact`
- **Create new contract test**: `php artisan make:test --pest Api/[ModuleName]ApiTest`
- **Format code**: `vendor/bin/pint --dirty`

### File Structure
- **Backend Tests**: `tests/Feature/Api/` (Contract enforcement)
- **Backend Controllers**: `app/Http/Controllers/Api/` (Standardized responses)
- **Frontend Types**: `mobile/src/types/index.ts` (Structural alignment)
- **Frontend API**: `mobile/src/api/` (Compatibility bridge)

---

## 7. Maintenance & Extension Guidelines
- **Contract First**: Any API change must start with a failing Pest test.
- **Synchronized Refactoring**: When updating `landlord.ts` or `tenant.ts`, ensure the `.data` extraction is handled internally to preserve UI method signatures.
- **Strict Flattening**: Avoid deep nesting in responses. If a field is needed by the mobile client, bring it to the root of the `data` object.
