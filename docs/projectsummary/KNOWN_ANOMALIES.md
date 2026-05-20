# Known Anomalies and Technical Debt

> Last updated: 2026-05-20

## Overview
This document comprehensively documents all known issues, deprecated package versions, breaking changes, workarounds, technical debt, non-obvious behaviors, and any deviations from standard practices in the Estate Practice application.

---

## Known Issues

### 1. Migration Date Anomalies

**Issue**: Some migration files have dates in the future (2025, 2026).

**Location**: `database/migrations/`

**Details**:
- Migration files were created with future dates during development planning
- This is intentional for ordering but may cause confusion

**Impact**: None - migrations execute based on filename ordering, not date

**Workaround**: None needed - this is by design

---

### 2. Duplicate Documentation Files

> **RESOLVED**: Documentation has been consolidated into `docs/projectsummary/` with 10 focused documents. The `docs/vision/` directory contains product vision and roadmap.

---

### 3. README.md is Empty

> **RESOLVED**: README.md has been populated with comprehensive documentation including tech stack, quick start, user roles, and key directories.

---

## Technical Debt

### 1. Hardcoded Values / String Role Comparisons

> **RESOLVED (Phase 1 Port)**: `App\Enums\Role` has been implemented as a PHP 8.1 backed string enum. The `User.role` column is cast to this enum in the model. All Policies, FormRequests, Controllers, and redirect logic now use `Role::Admin`, `Role::Landlord`, `Role::Tenant` — no string literals remain.

---

### 2. Missing API Resource Classes

**Issue**: API responses are returned directly from controllers without transformation

**Location**: `app/Http/Controllers/Api/`

> **RESOLVED (Epoch 2)**: All entities are now wrapped in strict Laravel `*Resource.php` API layer standards, wrapping JSON payloads cleanly inside a `'data'` block.

---

### 3. Mobile App (Partially Implemented)

**Issue**: Mobile app has core screens but may be missing some features

**Location**: `mobile/`

**Implemented Screens**:
- **Auth**: Login, Register screens
- **Tenant**: Dashboard, Payments, MakePayment, Utilities, UtilityBills, Profile
- **Landlord**: Dashboard, Properties, PropertyDetails, Units, Tenants, TenantDetails, TenancyUtilities, Payments, UtilityBills, Profile

**Status**:
- Basic API client implemented
- Auth module implemented
- Landlord API module implemented
- Tenant API module implemented
- Core UI screens implemented for both roles
- Navigation with bottom tabs and nested stacks

**Impact**: Core functionality available, additional features may be added over time.

---

### 4. API-Mobile Data Inconsistency (Standardization In Progress)

**Issue**: Inconsistent JSON structures between backend and mobile frontend, specifically regarding deep nesting vs. flat structures.

**Location**: `app/Http/Controllers/Api/` and `mobile/src/api/`

**Details**:
- Some endpoints return flat fields (`unit_number`) while others return objects (`unit: { unit_code }`).
- Single resource endpoints often lacked the `'data'` wrapper, causing mobile crashes.

**Status**:
- **Standardized**: Rent Bills (Landlord/Tenant), Dashboard `recent_payments`, Payments, and Documents have been flattened and wrapped in `data`.
- **Pending**: Utilities, Properties, and Units still benefit from periodic auditing as new fields are added.

**Workaround**: Mobile app uses defensive parsing `(response as any).data || response` until standardization is complete.

---

### 4. Missing Test Coverage

**Issue**: Limited test coverage

**Location**: No tests directory visible in standard location

> **RESOLVED (Epoch 3)**: Pest testing has been comprehensively adopted — 483 tests, 1428 assertions, 100% passing. Includes strict `ArchTest.php` architecture guardrails, Feature API end-to-end endpoint checking, and Data Isolation validation.

---

### 5. No API Versioning Middleware

> **RESOLVED (Stabilization)**: All API routes are now exclusively served under `/api/v1/`. Unversioned `/api/*` routes have been removed from `routes/api.php`. All 21 Pest API test files have been updated to target `/api/v1/`. The mobile `EXPO_PUBLIC_API_URL` is configured to `http://{host}:8000/api/v1`.

---

### 6. Security Event Implementation Incomplete

**Issue**: Security events are logged but not integrated everywhere needed

**Location**: `app/Models/SecurityEvent.php`

**Missing Events**:
- Password changes
- Login from new device
- Profile updates
- Role changes

**Workaround**: Add security event logging to relevant controllers

---

### 7. Missing Indexes

> **RESOLVED (Pre-Phase 3 + Phase 6)**: Performance indexes have been added to core tables including `payments.status`, `payments.paid_at`, `payments.tenant_id`, `payments.tenancy_id`, `payments.rent_bill_id`, `payments.utility_bill_id`, `tenancies.status`, `rent_bills.status`, `rent_bills.due_date`, `rent_bills.billing_month`. Additionally, the `documents` table includes composite indexes on `(documentable_type, documentable_id, category)` and `(documentable_type, documentable_id, uploaded_at)` for efficient polymorphic querying.

---

## Non-Obvious Behaviors

### 1. Tenant Auto-Username vs Manual Username Registration

**Behavior**: While landlords can auto-generate usernames for tenants during backend creation, mobile self-registering users now manually provide their own `username`. The primary login method for the mobile app relies entirely on this `username` instead of email.

**Format (Auto-generated)**: `firstname.lastname{randomNumber}`

**Example**: `john.doe837`

**Location**: `app/Services/TenantService.php` and `app/Actions/Fortify/CreateNewUser.php`

**Why**: Ensures unique usernames while being human-readable for backend-created tenants, while empowering self-registered users with custom login identities.

---

### 2. Unit Status Auto-Update

**Behavior**: Unit status changes automatically when tenancy starts/ends

**Logic**:
- When tenancy status becomes 'active' → unit status becomes 'occupied'
- When tenancy status becomes 'ended' → unit status becomes 'available'

**Location**: Tenant creation and deletion controllers

---

### 3. Session Cleanup

**Behavior**: Sessions are stored in database (config/session.php)

**Implication**: Large session table may impact performance

**Recommendation**: Use Redis for session storage in production

---

### 4. Rate Limiting on Sessions Endpoint

**Behavior**: `/api/auth/sessions` endpoint has stricter rate limiting (30/min)

**Reason**: Security - prevents session enumeration attacks

**Location**: `routes/api.php`

---

### 5. Two-Factor Authentication Flow

**Behavior**: 2FA requires password confirmation to enable/disable

**Location**: `app/Http/Controllers/Web/Settings/TwoFactorAuthenticationController.php`

**Why**: Security best practice

---

## Deprecated/Potentially Problematic Patterns

### 1. Using Auth Middleware Instead of Policies

**Pattern**: Controllers check ownership manually instead of using Laravel Policies

**Example**:
```php
// Current (not ideal)
if ($property->owner_id !== auth()->id() && auth()->user()->role !== 'admin') {
    abort(403);
}
```

**Recommendation**: Use Laravel Policies:
```php
// Better approach
$this->authorize('update', $property);
```

---

### 2. String-Based Role Checks

> **RESOLVED (Phase 1 Port)**: All string role checks have been replaced with `App\Enums\Role` enum comparisons. The `User.role` column is cast to the enum. Policies, FormRequests, and Controllers use only enum constants.

---

### 3. Direct Model Manipulation in Controllers

**Pattern**: Controllers directly manipulate models instead of using services

**Example**: In TenantController - direct model creation

> **RESOLVED (Epoch 2)**: Controllers were entirely stripped of fat business logic, decoupled into the `/app/Services/*` namespace (`TenantService`, `OnboardingService`, `DashboardServices`, etc.).

---

## Breaking Changes to Be Aware Of

### 1. API Token Expiration

**Change**: API tokens can have expiration dates

**Location**: `database/migrations/2026_03_05_173200_create_api_tokens_table.php`

**Impact**: Existing tokens without expiration will work indefinitely

**Future**: May implement automatic token expiration

---

### 2. Database Session Driver

**Current**: Uses database session driver

**Future**: Should migrate to Redis for production

---

### 3. Default Route Prefixes

> **RESOLVED (Stabilization)**: All API routes are now exclusively under `/api/v1/`. The `/api/*` unversioned routes have been removed.

---

## Package-Specific Issues

### 1. TailwindCSS 4.x Configuration

**Status**: Stable at v4.1.18. Uses `@tailwindcss/vite` plugin for v4 integration. All components and utilities are compatible.

---

### 2. Zod Version 4.x

**Status**: Stable at v4.x. Schema definitions are compatible with current version. No issues reported.

---

### 3. React 19 Compatibility

**Status**: Stable at v19.2.3. All UI libraries (Radix, shadcn, Recharts, framer-motion) are compatible.

---

## Deviation from Standard Practices

### 1. Mixed API/Web Controllers

**Deviation**: Both API and Web controllers exist in same application

**Rationale**: Supports both web (Inertia) and mobile (API) clients

**Consideration**: May want to separate into distinct API and Web applications in future

---

### 2. No Repository Pattern

**Deviation**: Using Eloquent models directly in controllers

**Rationale**: Laravel's Eloquent serves as both ORM and repository

**Alternative**: Could implement repository pattern for larger team

---

### 3. Database Transactions in Services

**Deviation**: Some database transactions are handled in controllers, others in services

**Standardization**: Move all transaction handling to service layer

---

### 4. Inline Ownership Checks in Controllers

**Deviation**: Checking ownership inline `if ($unit->property->owner_id !== $user->id) { abort(403); }` is accepted.

**Rationale**: While Policies are the Laravel standard, this direct approach is currently used to bypass deep eager loading overhead in simple data-fetching routes. It is an accepted architectural anomaly until Phase 4 (Authorization Refactor).

---

## Migration Notes

### Pending Migrations

None currently - all migrations have been applied.

### Schema Migrations Issues

**Issue**: Some migrations may fail if run out of order

**Reason**: Foreign key constraints

**Solution**: Always run migrations in order, use `php artisan migrate`

---

## Configuration Notes

### Environment-Specific Behavior

| Variable | Local | Production |
|----------|-------|------------|
| APP_DEBUG | true | false |
| SESSION_DRIVER | file | redis |
| CACHE_STORE | file | redis |
| QUEUE_CONNECTION | sync | redis |

---

### Anomaly: `PaymentGatewayServiceProvider` not registered

**File**: `app/Providers/PaymentGatewayServiceProvider.php`
**Status**: Accepted — intentional scaffold
**Reason**: The payment gateway design is not yet finalized. The provider, gateway
contracts, and drivers were ported as dead scaffold code to allow future activation
without a full re-implementation. Zero runtime impact while unregistered.
**To activate**: Add `App\Providers\PaymentGatewayServiceProvider::class` to
`bootstrap/providers.php` and register `routes/webhooks.php` in `bootstrap/app.php`.
**Reference**: `docs/plans/porting-plan.md`, `docs/plans/payment-scaffold-plan.md`

---

## Summary

This document covers:

1. **Known Issues**: Migration dates, duplicate docs
2. **Technical Debt**: Incomplete mobile app, incomplete security event logging, API-mobile standardization (Utilities/Properties/Units pending)
3. **Non-Obvious Behaviors**: Auto-username, unit status auto-update, session storage, rate limiting, 2FA flow
4. **Resolved Items**:
   - Role enum implementation — `App\Enums\Role` is the canonical source of truth ✔
   - API Resource classes — all endpoints wrapped in `*Resource.php` layer ✔
   - Test coverage — 483 tests, 1428 assertions ✔
   - API Versioning — exclusively `/api/v1/`, unversioned routes removed ✔
   - String-based role checks — replaced with enum comparisons — no string literals ✔
   - Service layer extraction — controllers delegating to service classes ✔
   - ReceiptService/DomPDF — PDF receipt generation ✔
   - Payment gateway scaffold — contracts, drivers, events, listeners ✔
   - Document Storage System — polymorphic file attachment, validation, authorization, web + mobile UI ✔
   - Performance indexes — added to payments, tenancies, rent_bills, documents tables ✔
5. **Breaking Changes**: API token expiration, session driver
6. **Package Issues**: TailwindCSS 4, Zod 4, React 19 compatibility
7. **Deviations**: Mixed controllers, no repository pattern, inconsistent transactions
8. **Migration Notes**: Schema migration handling
9. **Configuration Notes**: Environment-specific behavior
10. **Inline Ownership Checks**: Direct checks in controllers instead of Policies are an accepted anomaly.
