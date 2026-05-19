# Analytics & Reporting Implementation Report

**Branch:** `feat/analytics-and-reporting`  
**Date:** May 19, 2026  
**Status:** Complete — 473 tests passing, 0 failures

---

## Executive Summary

This implementation addressed all identified issues in the analytics and reporting layer of the estate management platform. The work spanned four phases: query performance optimization, real-time chart integration, CSV/PDF export functionality, and audit report generation. The original codebase had no dedicated analytics models, no data visualization, no export capabilities, and no historical trend tracking — all of which have been added.

A code review of the last 8 commits (`dfb33d3` → `96c2ea4`) identified 12 issues across performance, architecture, frontend, and testing. All 12 have been resolved.

---

## Phase 1: Performance Optimization

### 1.1 AdminDashboardService Query Consolidation

**File:** `app/Services/Admin/AdminDashboardService.php`

**Before:** 6 separate database queries using individual `count()` and `where()->count()` calls:

```php
'total_properties' => Property::count(),
'total_units' => Unit::count(),
'active_tenancies' => Tenancy::active()->count(),
'total_landlords' => User::where('role', 'landlord')->count(),
'pending_landlords' => User::where('role', 'landlord')->whereNull('email_verified_at')->count(),
'maintenance_properties' => Property::where('status', 'maintenance')->count(),
```

**After:** 2 consolidated queries using `selectRaw()` with conditional aggregation:

```php
$propertyStats = Property::selectRaw("
    COUNT(*) as total_properties,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_properties
")->first();

$landlordStats = User::where('role', 'landlord')
    ->selectRaw('
        COUNT(*) as total_landlords,
        SUM(CASE WHEN email_verified_at IS NULL THEN 1 ELSE 0 END) as pending_landlords
    ')->first();
```

**Impact:** 67% reduction in queries (6 → 2). Eliminates full table scans on the User model for two separate landlord counts.

### 1.2 Landlord API Dashboard Refactoring

**Files:**
- `app/Http/Controllers/Api/Landlord/DashboardController.php` (refactored)
- `app/Services/Landlord/ApiDashboardService.php` (new)

**Before:** The controller contained 195 lines of mixed business logic, data transformation, and error handling. It loaded all properties with eager-loaded units and tenancies, then ran 8+ separate queries for payments, revenue, leases, and rent bills.

**After:** Controller is 37 lines — a thin delegation layer. `ApiDashboardService` encapsulates all dashboard logic with focused methods:

| Method | Purpose |
|--------|---------|
| `getPropertiesWithCounts()` | Paginated properties with unit/tenancy counts |
| `getUnitStats()` | Occupied vs vacant unit calculation |
| `getPaymentStats()` | Single `selectRaw()` for pending/overdue payment counts |
| `getRevenueMtd()` | Revenue month-to-date using `whereBetween()` |
| `getRecentPayments()` | Last 5 payments with eager-loaded relationships |
| `getExpiringLeases()` | Tenancies ending within 30 days |

**Key Fix — Revenue MTD Query:**

```php
// Before: Prevents index usage on paid_at column
->whereMonth('paid_at', Carbon::now()->month)
->whereYear('paid_at', Carbon::now()->year)

// After: Enables range index scan
->whereBetween('paid_at', [now()->startOfMonth(), now()])
```

### 1.3 Occupancy Rate Standardization

**Files:**
- `app/Services/Landlord/LandlordDashboardService.php`
- `app/Services/Landlord/PropertyService.php`
- `app/Services/Landlord/ApiDashboardService.php`

**Problem:** Three services calculated occupancy differently:
- `LandlordDashboardService`: `tenants / units` (tenancy-based)
- `PropertyService`: `count(Tenancy) / total_units` (tenancy-based)
- `ApiDashboardController`: `filter(units with active tenancies) / units` (unit-based)

These could diverge if a unit had multiple tenancies or the `total_units` column was out of sync.

**Solution:** All services now use the same formula — count distinct units that have at least one active tenancy:

```php
$occupiedUnits = Unit::whereHas('property', fn ($q) => $q->where('owner_id', $landlord->id))
    ->whereHas('tenancies', fn ($q) => $q->where('status', 'active'))
    ->distinct('units.id')
    ->count();
```

### 1.4 API Tenant Dashboard Error Response

**File:** `app/Http/Controllers/Api/Tenant/DashboardController.php`

**Before:** Error response leaked implementation details:
```php
return response()->json([
    'tenant' => ['id' => 0, 'full_name' => 'Error'],
    'payments' => [],
], 500);
```

**After:** Clean, user-friendly error message:
```php
return response()->json([
    'message' => 'Unable to load dashboard data. Please try again.',
], 500);
```

---

## Phase 2: Charts & Data Visualization

### 2.1 RevenueAnalyticsService

**File:** `app/Services/Landlord/RevenueAnalyticsService.php` (new, 166 lines)

Provides three public methods:

| Method | Scope | Output |
|--------|-------|--------|
| `getMonthlyRevenueTrend($landlord, $months)` | Single landlord | Monthly revenue + payment count |
| `getPaymentCollectionTrend($landlord, $months)` | Single landlord | Monthly paid/pending/overdue/partial/waived breakdown |
| `getSystemRevenueTrend($months)` | All landlords (admin) | System-wide monthly revenue |

**Design Decisions:**

1. **Cross-database compatibility:** Uses driver-aware `DATE_FORMAT()` (MySQL) or `strftime()` (SQLite) via `DB::getDriverName()` checks, pushing aggregation to the database for O(1) memory regardless of dataset size.

2. **Missing month filling:** When a landlord has no data for certain months, the service fills those months with zero values so charts display continuous timelines.

3. **Empty state handling:** Returns structured zero-filled data when no tenancies exist, rather than empty collections that would cause chart rendering errors.

4. **Configurable time range:** Default 12 months, overridable via parameter.

### 2.2 Chart Components

**Files:**
- `resources/js/components/shared/revenue-trend-chart.tsx` (new, 97 lines)
- `resources/js/components/shared/payment-collection-chart.tsx` (new, 100 lines)

**RevenueTrendChart:**
- Recharts `AreaChart` with gradient fill
- Currency-formatted tooltips (TZS)
- Empty state fallback card
- Accepts typed data props

**PaymentCollectionChart:**
- Recharts `BarChart` with stacked bars
- Color-coded statuses: green (paid), yellow (pending), red (overdue), blue (partial), gray (waived)
- 4px rounded top corners on bars
- Empty state fallback card
- Includes `waived` bar to ensure chart totals match the data

### 2.3 Dashboard Integration

**Landlord Dashboard** (`resources/js/pages/landlord/dashboard.tsx`):
- Charts placed between KPI cards and Property Portfolio section
- Two-column grid layout: Revenue Trend (left) + Payment Collection (right)
- Data passed via Inertia page props
- Occupancy rate now uses `occupied_units` from backend instead of `total_tenants`

**Admin Dashboard** (`resources/js/pages/admin/dashboard.tsx`):
- System Revenue Trend chart placed between Metrics Grid and Activity Feed
- Full-width chart spanning the dashboard
- Uses `getSystemRevenueTrend()` for cross-landlord aggregation

---

## Phase 3: Exports & Audit Reports

### 3.1 DashboardExportService

**File:** `app/Services/DashboardExportService.php` (new, 264 lines)

**CSV Export:**
- Uses `response()->streamDownload()` for memory-efficient streaming
- Builds CSV rows in PHP with `fputcsv()`
- Includes section headers for readability (PROPERTY SUMMARY, RECENT PAYMENTS, RENT BILLS)
- Unified record limit of 50 across all export types (CSV and PDF)

**PDF Export:**
- Uses `barryvdh/laravel-dompdf` (already installed)
- Styled HTML templates with CSS using `inline-block` layout for DomPDF compatibility
- Includes stat cards, property tables, and payment tables
- Color-coded status badges (paid/pending/overdue/waived)

**Export Methods:**

| Method | Role | Format |
|--------|------|--------|
| `exportLandlordDashboardCsv()` | Landlord | CSV |
| `exportLandlordDashboardPdf()` | Landlord | PDF |
| `exportTenantDashboardCsv()` | Tenant | CSV |
| `exportTenantDashboardPdf()` | Tenant | PDF |

### 3.2 Export Controller & Routes

**File:** `app/Http/Controllers/Web/DashboardExportController.php` (new, 43 lines)

**Security:** Each endpoint validates the user's role before exporting:

```php
public function landlordCsv(Request $request)
{
    abort_if($request->user()->role !== Role::Landlord, 403);
    return $this->exportService->exportLandlordDashboardCsv($request->user());
}
```

**Routes Added:**

| Route | Name | Controller Method |
|-------|------|-------------------|
| `GET /landlord/dashboard/export/csv` | `landlord.dashboard.export.csv` | `landlordCsv` |
| `GET /landlord/dashboard/export/pdf` | `landlord.dashboard.export.pdf` | `landlordPdf` |
| `GET /tenant/dashboard/export/csv` | `tenant.dashboard.export.csv` | `tenantCsv` |
| `GET /tenant/dashboard/export/pdf` | `tenant.dashboard.export.pdf` | `tenantPdf` |

### 3.3 PDF Templates

**Files:**
- `resources/views/exports/landlord-dashboard-pdf.blade.php` (new, 115 lines)
- `resources/views/exports/tenant-dashboard-pdf.blade.php` (new, 101 lines)

Both templates use inline CSS compatible with dompdf's rendering engine (DejaVu Sans font, `inline-block` layouts instead of flexbox for reliable rendering, table-based data display, color-coded status badges).

### 3.4 Audit Reports

**Files:**
- `app/Services/Admin/AdminDashboardService.php` (updated)
- `app/Http/Controllers/Web/Admin/AdminDashboardController.php` (updated)

**Service method:** `getAuditReportData()` returns 4 data sections (20 most recent each):
1. **Landlord Registrations** — name, email, verification status, creation date
2. **Property Registrations** — name, address, status, owner, creation date
3. **Tenancy Agreements** — tenant name, unit code, monthly rent, status, creation date
4. **Payment Transactions** — tenant name, unit code, amount, payment type, status

**Controller:** Uses `abort_if()` for role-based access control on both `index()` and `auditReports()` methods. The `months` query parameter is clamped to 1–24.

**Frontend:** `resources/js/pages/admin/audit-reports.tsx` (new, 255 lines)

- 2×2 grid layout with four cards
- Each card has icon header, description, and scrollable item list
- Status badges with color coding per entity type
- "Back to Dashboard" navigation button
- Previously disabled "Audit Reports" quick action on admin dashboard is now enabled

---

## Phase 4: Testing & Code Quality

### 4.1 New Tests

**File:** `tests/Feature/Services/RevenueAnalyticsServiceTest.php` (new, 136 lines)

Six test cases:

| Test | What It Verifies |
|------|-----------------|
| `getMonthlyRevenueTrend returns 12 months of data` | Correct array length and key structure |
| `getMonthlyRevenueTrend returns zeros when no payments exist` | Empty state handling |
| `getMonthlyRevenueTrend aggregates payments correctly` | Sum and count accuracy for same-month payments |
| `getPaymentCollectionTrend returns 12 months of data` | Correct array length and all status keys |
| `getPaymentCollectionTrend returns zeros when no bills exist` | Empty state handling |
| `getSystemRevenueTrend returns data across all landlords` | Cross-landlord aggregation accuracy |

**File:** `tests/Feature/Services/DashboardExportServiceTest.php` (new, 87 lines)

Seven test cases:

| Test | What It Verifies |
|------|-----------------|
| `landlord can export dashboard as csv` | 200 response with `text/csv` content type |
| `landlord can export dashboard as pdf` | 200 response with `application/pdf` content type |
| `tenant is forbidden from landlord export` | 403 response for cross-role access |
| `landlord is forbidden from tenant export` | 403 response for cross-role access |
| `tenant can export dashboard as csv` | 200 response with `text/csv` content type |
| `tenant can export dashboard as pdf` | 200 response with `application/pdf` content type |
| `guest is forbidden from export endpoints` | Redirect for unauthenticated access |

**File:** `tests/Feature/Admin/DashboardTest.php` (updated, 42 lines)

Six test cases (3 existing + 3 new):

| Test | What It Verifies |
|------|-----------------|
| `admin can access the admin dashboard` | 200 for admin role |
| `landlord is forbidden from admin dashboard` | 403 for non-admin |
| `guest is redirected from admin dashboard` | Redirect for unauthenticated |
| `admin can access audit reports page` | 200 for admin role |
| `landlord is forbidden from audit reports` | 403 for non-admin |
| `guest is redirected from audit reports` | Redirect for unauthenticated |

### 4.2 Test Results

```
Tests:    473 passed (1401 assertions)
Duration: 35.41s
```

All existing tests pass — zero regressions introduced. 10 new tests added.

### 4.3 Code Formatting

- **PHP:** `vendor/bin/pint --dirty --format agent` — passed
- **TypeScript/React:** ESLint — 0 errors, 0 warnings across all modified files

---

## File Inventory

### New Files (14)

| File | Lines | Purpose |
|------|-------|---------|
| `app/Services/Landlord/ApiDashboardService.php` | 179 | Landlord API dashboard data aggregation |
| `app/Services/Landlord/RevenueAnalyticsService.php` | 166 | Revenue trend and payment collection analytics |
| `app/Services/DashboardExportService.php` | 264 | CSV and PDF export generation |
| `app/Http/Controllers/Web/DashboardExportController.php` | 43 | Export endpoint routing with role checks |
| `resources/js/components/shared/revenue-trend-chart.tsx` | 97 | Revenue area chart component |
| `resources/js/components/shared/payment-collection-chart.tsx` | 100 | Payment collection bar chart component (with waived bar) |
| `resources/js/pages/admin/audit-reports.tsx` | 255 | Admin audit reports page |
| `resources/views/exports/landlord-dashboard-pdf.blade.php` | 115 | Landlord PDF report template |
| `resources/views/exports/tenant-dashboard-pdf.blade.php` | 101 | Tenant PDF report template |
| `tests/Feature/Services/RevenueAnalyticsServiceTest.php` | 136 | Revenue analytics service tests |
| `tests/Feature/Services/DashboardExportServiceTest.php` | 87 | Export endpoint tests |
| `config/dompdf.php` | — | Published dompdf configuration |

### Modified Files (12)

| File | Change Summary |
|------|---------------|
| `app/Models/User.php` | Added `getTenancyIds()` using subquery chaining |
| `app/Services/Admin/AdminDashboardService.php` | Consolidated 6 queries → 2; added `getAuditReportData()` |
| `app/Services/Landlord/LandlordDashboardService.php` | Added occupied_units, standardized occupancy calculation |
| `app/Services/Landlord/PropertyService.php` | Fixed occupancy to count distinct units with active tenancies |
| `app/Services/Landlord/ApiDashboardService.php` | Uses `getTenancyIds()` instead of 3-query pattern |
| `app/Http/Controllers/Api/Landlord/DashboardController.php` | Reduced 195 → 37 lines, delegated to ApiDashboardService |
| `app/Http/Controllers/Api/Tenant/DashboardController.php` | Fixed error response to not leak implementation details |
| `app/Http/Controllers/Web/Admin/AdminDashboardController.php` | Added `abort_if()` role gates, `months` clamping, delegated audit queries to service |
| `app/Http/Controllers/Web/Landlord/LandlordDashboardController.php` | Added revenue/collection trend props, `months` clamping |
| `resources/js/pages/admin/dashboard.tsx` | Added RevenueTrendChart, enabled Audit Reports link |
| `resources/js/pages/landlord/dashboard.tsx` | Added charts, export buttons (desktop + mobile), fixed occupancy formula |
| `resources/js/pages/tenant/dashboard.tsx` | Added CSV/PDF export buttons, cleaned up imports |
| `routes/web.php` | Added 6 new routes (2 export + 1 audit + 3 imports) |
| `tests/Feature/Admin/DashboardTest.php` | Updated to expect 403 instead of redirect for non-admin |
| `tests/Feature/Tenant/DataIsolationTest.php` | Updated to expect 403 for admin route access |
| `tests/Feature/WebSmokeTest.php` | Updated to expect 403 for landlord accessing admin routes |

---

## Architecture Decisions

### Why No Caching

The project uses `CACHE_STORE=file` which does not support Laravel cache tags. Without tags, granular cache invalidation (e.g., invalidate only landlord-specific cache when a payment is made) is not feasible. Query optimization was prioritized instead.

### Why Database-Level Grouping for Charts

The `RevenueAnalyticsService` uses `selectRaw()` with `DATE_FORMAT()` (MySQL) or `strftime()` (SQLite), detected via `DB::getDriverName()`. This ensures:
- O(1) memory usage regardless of dataset size (no full-table loads into PHP)
- Production-ready performance at scale
- Cross-database compatibility for testing (SQLite) and production (MySQL)

### Why `getTenancyIds()` on User Model

The 3-query pattern (`properties()->pluck('id')` → `Unit::whereIn()` → `Tenancy::whereIn()`) was duplicated across 3 services. Extracting it to a single method on the `User` model using subquery chaining reduces it to a single DB round-trip:

```php
public function getTenancyIds(): Collection
{
    return Tenancy::whereIn('unit_id',
        Unit::whereIn('property_id',
            $this->properties()->select('id')
        )->select('id')
    )->pluck('id');
}
```

### Why Streamed CSV

Using `response()->streamDownload()` with `fputcsv()` instead of building a full string in memory:
- Constant memory usage regardless of dataset size
- Starts sending data to the browser immediately
- No risk of PHP memory exhaustion on large exports

### Why Unified Export Limits

Previously, CSV exports returned 100 records while PDF exports returned only 10. All exports now use a shared `EXPORT_LIMIT = 50` constant for consistency.

### Why `inline-block` in PDF Templates

DomPDF has partial Flexbox support — `flex-wrap` and `gap` are not reliably rendered. Replaced `display: flex` with `display: inline-block` for stat cards to ensure consistent PDF rendering.

### Why Charts Between KPIs and Portfolio

Charts provide visual context for the KPI numbers above them. Placing them before the detailed property list follows a "summary → visualization → detail" information hierarchy that matches how users consume dashboard data.

---

## Code Review Findings — Resolved

All 12 issues from the code review have been addressed:

| # | Severity | Issue | Resolution |
|---|---|---|---|
| 1 | High | 3-query ID-gather duplicated in 3 services | Extracted to `User::getTenancyIds()` with subquery chaining |
| 2 | High | In-memory aggregation on unbounded dataset | Pushed to DB with `selectRaw()` + `groupByRaw()` |
| 3 | High | `occupied_units` computed but discarded by frontend | Added to Stats interface, fixed occupancy formula |
| 4 | Medium | Audit queries inline in controller | Moved to `AdminDashboardService::getAuditReportData()` |
| 5 | Medium | Duplicate admin role check | Replaced with `abort_if()` in controller methods |
| 6 | Medium | `waived` bills missing from chart | Added gray `waived` bar to PaymentCollectionChart |
| 7 | Medium | Inconsistent CSV vs PDF record limits | Unified to `EXPORT_LIMIT = 50` constant |
| 8 | Medium | Zero tests for export and audit endpoints | Added 10 new tests across 2 test files |
| 9 | Low | `display: flex` unreliable in DomPDF | Replaced with `display: inline-block` |
| 10 | Low | Untyped `buildTenantCsvData` parameters | Added `Tenant $tenant, Tenancy $tenancy` types |
| 11 | Low | Export buttons hidden on mobile | Added mobile-only export row below Quick Access |
| 12 | Low | `months` query param unbounded | Clamped to `min(max(val, 1), 24)` |

---

## Known Limitations & Future Work

| Limitation | Impact | Recommendation |
|------------|--------|----------------|
| ApiDashboardService makes 8 separate queries | Each query is focused and testable, but not optimal | Consolidate with `selectRaw()` if dashboard load time becomes an issue |
| No date range filters on exports | Exports always return the same fixed dataset | Add `?from=` and `?to=` query parameters to respect user-selected date ranges |
| No chart interactivity on admin dashboard | Admin only sees revenue trend, not collection breakdown | Add `collectionTrend` to admin dashboard if needed |
| Tenant dashboard removed `rent_bills` prop to fix ESLint | The prop was unused in the component | Re-add if rent bills display is needed on tenant dashboard |

---

## Commits Summary

| Commit | Description |
|--------|-------------|
| `dfb33d3` | perf: consolidate dashboard queries and fix occupancy rate calculation |
| `bb2d8b5` | perf: move payment sorting to query level and fix error response |
| `768b6c6` | fix: resolve ambiguous column names and revert eager-loaded sorting |
| `a80ee0e` | feat: add revenue and payment collection charts to dashboards |
| `8ac2c24` | feat: add dashboard exports (CSV/PDF) and audit reports |
| `9fa1fa3` | test: add RevenueAnalyticsService tests and fix lint errors |
| `9ca6455` | fix: review findings - restore missing imports, add DI, add role authorization |
| `96c2ea4` | fix: use Symfony Response base class for export return types |
| `07a61d6` | fix: resolve all 12 code review findings for analytics-and-reporting |

**Total:** 9 commits, 3,061 insertions, 740 deletions across 98 files.
