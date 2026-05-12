# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Security
- Removed exception internals (`getFile()`, `getLine()`) from API responses (C1)
- Added Sanctum token expiration: 30 days, with daily prune schedule (C3)
- Changed `payments` and `rent_bills` foreign keys from CASCADE to RESTRICT on delete (C4)
- Wired all 10 Laravel Policies into API controllers, replacing inline authorization (H1)

### Fixed
- `db:seed --force` removed from `start.sh` — no longer runs on every container restart (C2)
- `tenant_code` race condition: now generated from actual row ID after insert, with unique DB constraint (H2)
- `TenancyUtilityController` and `UtilityBillController`: resolved undefined `$landlord` variable (P0)
- `PaymentPolicy` lazy-loading: added eager loading before `authorize()` calls (P2)

### Added
- Queue worker (`queue:work`) added to `start.sh` for background job processing (M1)
- `migrate:fresh` step added to CI to verify migration ordering on every run (M5)
- Performance indexes on `payments`, `utility_bills`, `tenancy_utilities` (M3)
- Cross-ownership 403 authorization tests for all API controller groups (W2-TEST)
- Web smoke tests for all authenticated Inertia routes (SMOKE)
- Sentry error tracking (M4)
- phpredis extension in Dockerfile; Redis configured as production driver (M2)

### Refactored
- Landlord dashboard: replaced 6 repeated correlated subqueries with single `$tenancyIds` extraction (H4)
- `Tenant\PaymentsController::store()` delegated to `PaymentService::processPayment()` (H5)
- API error responses standardized from `error` key to `message` key (M6)

### Chore
- Deleted ~4.8 MB dev artifacts from repo root (L1)
- Fixed `APP_NAME=Estate` in `.env.example` (L2)
- Deleted duplicate doc file with spaces in filename (L3)
- `render.yaml` `buildCommand` documented as unused with Docker (C5)
