# Known Anomalies and Technical Debt

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

**Issue**: Duplicate or outdated documentation files exist in docs/

**Location**: `docs/`

**Files**:
- `docs/user _flow _logic.md` - Contains space in filename (should be `user_flow_logic.md`)
- `docs/user_flow_logic.md` - Current active version
- `docs/OVERVIEW.md` - Contains some outdated information about Laravel version

**Impact**: Confusion about which documentation is current

**Workaround**: Use `docs/user_flow_logic.md` as the authoritative source for user flow logic

---

### 3. README.md is Empty

> **RESOLVED**: README.md has been populated with comprehensive documentation including tech stack, quick start, user roles, and key directories.

---

## Technical Debt

### 1. Hardcoded Values

**Location**: Various controllers and services

**Examples**:
- Hardcoded role names in controllers
- String-based role checks instead of constants

**Impact**: Potential for typos, harder to maintain

**Recommendation**: Create Role enum constants:
```php
namespace App\Enums;

enum Role: string
{
    case ADMIN = 'admin';
    case LANDLORD = 'landlord';
    case TENANT = 'tenant';
}
```

---

### 2. Missing API Resource Classes

**Issue**: API responses are returned directly from controllers without transformation

**Location**: `app/Http/Controllers/Api/`

**Impact**: 
- Inconsistent response formats
- No data transformation layer
- Harder to version API

**Recommendation**: Implement Laravel API Resources:
```php
php artisan make:resource PropertyResource
php artisan make:resource PropertyCollection
```

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

**Impact**: Core functionality available, additional features may be added over time

---

### 4. Missing Test Coverage

**Issue**: Limited test coverage

**Location**: No tests directory visible in standard location

**Impact**: Risk of regressions

**Recommendation**: Add comprehensive tests:
- Unit tests for services
- Feature tests for controllers
- Integration tests for API endpoints

---

### 5. No API Versioning Middleware

**Issue**: API routes don't have proper version isolation

**Location**: `routes/api.php`

**Current**: Both `/api/*` and `/api/v1/*` exist

**Impact**: Potential confusion about which version to use

**Recommendation**: Standardize on `/api/v1/` prefix and remove unversioned routes

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

**Issue**: Some database queries may be slow due to missing indexes

**Potential Missing Indexes**:
- `tenancies.status` (if querying by status frequently)
- `payments.status` (payment filtering)
- `tenancies.start_date` and `tenancies.end_date` (date range queries)

**Recommendation**: Add indexes for frequently queried columns

---

## Non-Obvious Behaviors

### 1. Tenant Auto-Username Generation

**Behavior**: When creating a tenant, the system auto-generates a username

**Format**: `firstname.lastname{randomNumber}`

**Example**: `john.doe837`

**Location**: `app/Services/TenantService.php`

**Why**: Ensures unique usernames while being human-readable

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

**Pattern**: Role checks use string literals

**Example**:
```php
if ($user->role === 'landlord') { ... }
```

**Recommendation**: Use enum constants

---

### 3. Direct Model Manipulation in Controllers

**Pattern**: Controllers directly manipulate models instead of using services

**Example**: In TenantController - direct model creation

**Recommendation**: Move all business logic to service classes

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

**Current**: Mixed use of `/api/` and `/api/v1/`

**Future**: Will standardize on `/api/v1/` only

---

## Package-Specific Issues

### 1. TailwindCSS 4.0 Configuration

**Issue**: TailwindCSS 4.0 has different configuration structure than 3.x

**Location**: `tailwind.config.js`

**Current**: Uses v4 format but some plugins may not be compatible

**Workaround**: Ensure all Tailwind plugins support v4

---

### 2. Zod Version 4.x

**Issue**: Using Zod 4.x which may have breaking changes from v3

**Location**: `package.json`

**Impact**: Schema definitions may need updates

**Workaround**: Pin to specific version if issues arise

---

### 3. React 19 Compatibility

**Issue**: React 19 is relatively new, some libraries may have compatibility issues

**Location**: `package.json`

**Monitor**: Watch for library updates addressing React 19 compatibility

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

## Summary

This document covers:

1. **Known Issues**: Migration dates, duplicate docs, empty README
2. **Technical Debt**: Hardcoded values, missing API resources, incomplete mobile app, missing tests, incomplete security logging
3. **Non-Obvious Behaviors**: Auto-username, unit status auto-update, session storage, rate limiting, 2FA flow
4. **Deprecated Patterns**: Manual authorization, string roles, direct model manipulation
5. **Breaking Changes**: API token expiration, session driver, route prefixes
6. **Package Issues**: TailwindCSS 4, Zod 4, React 19 compatibility
7. **Deviations**: Mixed controllers, no repository pattern, inconsistent transactions
8. **Migration Notes**: Schema migration handling
9. **Configuration Notes**: Environment-specific behavior
