# Estate — Feature Inventory

> Extracted from: [README](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/README.md), [roadmap](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/docs/vision/roadmap.md), [vision](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/docs/vision/vision.md), [overview](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/docs/projectsummary/OVERVIEW.md), [changelog](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/CHANGELOG.md), [known anomalies](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/docs/projectsummary/KNOWN_ANOMALIES.md), [frontend plan](file:///c:/Users/Admin/Desktop/SurveyCorps/Projects/estate/docs/FRONTEND_IMPLEMENTATION_PLAN.md)

**Overall Project Completion: ~85%** · 512 tests, 1561 assertions

---

## ✅ Complete

### Authentication & Authorization (95%)

| # | Feature | Notes |
|---|---------|-------|
| 1 | Fortify-based web auth (registration, login, password reset) | Session-based |
| 2 | Sanctum-based API auth for mobile | Permanent tokens per device |
| 3 | Two-factor authentication (2FA with TOTP/QR/recovery codes) | Password confirmation required to toggle |
| 4 | Type-safe `Role` enum (`Admin`, `Landlord`, `Tenant`) | Single source of truth for all authorization |
| 5 | Laravel Policies wired into all API controllers | Replaces inline authorization |
| 6 | Role-based post-login redirect | Via `LoginResponse` and `/dashboard` guard |
| 7 | Profile editing, deletion, password update with throttling | Settings area: profile, password, appearance, 2FA |
| 8 | Sanctum token expiration (30 days) + daily prune schedule | Changelog security fix |
| 9 | Rate limiting on sessions endpoint (30/min) | Anti-enumeration |

---

### Property & Unit Management (95%)

| # | Feature | Notes |
|---|---------|-------|
| 10 | Full CRUD for properties | Admin/landlord, policy-enforced |
| 11 | Full CRUD for units | Organized per property |
| 12 | Unit status auto-update on tenancy start/end | Occupied ↔ available |
| 13 | Property deletion restricted to Admin only | Policy-enforced |
| 14 | Performance indexes on core tables | `payments`, `tenancies`, `rent_bills`, `documents` |

---

### Tenant & Tenancy Management (95%)

| # | Feature | Notes |
|---|---------|-------|
| 15 | Tenant creation with auto-generated credentials | `firstname.lastname{random}` username |
| 16 | Tenant self-registration on mobile | Custom username |
| 17 | Tenancy state machine | pending → active → expired / ended |
| 18 | Tenant code generation from actual row ID | Race condition fixed, unique DB constraint |
| 19 | CSV bulk import (properties, units, tenants, tenancies) | 17-column CSV, dry-run preview, per-row transactions, 28 tests |
| 20 | CSV template download | In-memory `fputcsv`, no file on disk |
| 21 | Auto-create user accounts for imported tenants | `must_change_password = true` |
| 22 | Import history and audit log | `CsvImportBatch` model with errors, summary, timestamp |
| 23 | Import completion notifications | Sent to landlord + all admins |

---

### Billing — Rent & Utilities (90%)

| # | Feature | Notes |
|---|---------|-------|
| 24 | Automated monthly rent bill generation | Scheduled command: `rent-bills:generate-monthly` |
| 25 | Automated daily overdue marking | Scheduled command: `rent-bills:mark-overdue` |
| 26 | Utility billing per unit | Three-table pattern (types → tenancy_utilities → bills) |
| 27 | Utility type catalog | Water, Electricity, Gas, Internet, Security, Janitor, Garbage, Parking |
| 28 | Bill status tracking | `BillStatus` enum: pending, paid, partial, overdue, waived |
| 29 | Bill waiving capability | Landlord can waive bills |
| 30 | Rent bill statistics on dashboards | Pending, overdue, outstanding amounts |

---

### Payments & Receipts (95%)

| # | Feature | Notes |
|---|---------|-------|
| 31 | Landlord payment recording and management | Full CRUD |
| 32 | Tenant payment via mobile | Links to `RentBill` or `UtilityBill` |
| 33 | Payment status tracking | `PaymentStatus` enum: paid, pending, partial, overdue, waived, failed |
| 34 | Payment method tracking | `PaymentMethod` enum: cash, mobile_money, bank_transfer, card |
| 35 | Payment history with full transaction records | Overdue visibility at a glance |
| 36 | PDF receipt generation (on-demand streaming) | `ReceiptService` + DomPDF |
| 37 | Receipt download endpoints | Landlord and tenant API routes |
| 38 | Foreign keys changed to RESTRICT on delete | Prevents orphaned payment/bill records |
| 39 | `PaymentService::processPayment()` extraction | Clean service delegation |

---

### Notification System (95%)

| # | Feature | Notes |
|---|---------|-------|
| 40 | 10 notification types | PaymentReceived, RentBillGenerated, RentBillOverdue, CsvImportCompleted, etc. |
| 41 | 5 delivery channels | Database, Mail, WhatsApp (Twilio), Expo Push, WebSocket Broadcast |
| 42 | Real-time toast notifications via Laravel Reverb | `use-real-time-notifications` hook + Echo |
| 43 | Push token management API | Register/remove endpoints, auto-clear on DeviceNotRegistered |
| 44 | In-app notification inbox (all 3 roles) | Web + API, pagination, filters, mark read/unread |
| 45 | Admin notification system | New landlords, verifications, tenancy summaries, system errors |
| 46 | `ManagesNotifications` trait | Eliminated 3→1 controller duplication |

---

### Analytics & Reporting (80%)

| # | Feature | Notes |
|---|---------|-------|
| 47 | Revenue trend charts (Recharts AreaChart) | 12-month rolling, cross-database compatible |
| 48 | Payment collection breakdown (stacked BarChart) | Paid/pending/overdue/partial/waived |
| 49 | Occupancy rate (standardized formula) | Distinct units with active tenancies |
| 50 | CSV export for dashboards | Streamed, 50-record limit |
| 51 | PDF export for dashboards | DomPDF templates, role-gated |
| 52 | Admin audit reports page | 4-section grid: registrations, properties, tenancies, payments |
| 53 | `RevenueAnalyticsService` | Centralized analytics logic |

---

### Document Storage (90%)

| # | Feature | Notes |
|---|---------|-------|
| 54 | Polymorphic document attachments | `documentable` morph to tenancies (payments/properties schema-ready) |
| 55 | File upload with MIME + size validation | UUID-based paths, `config/documents.php` |
| 56 | Document listing and download (web + mobile) | Landlord tenant-show page, tenant `/documents` page |
| 57 | `DocumentPolicy` with role-based access | N+1-free ownership checks |
| 58 | Soft deletes for documents | Recoverable |
| 59 | Mobile document support | `expo-document-picker`, landlord full CRUD, tenant read-only |
| 60 | `documents:backfill` artisan command | Migrates legacy `tenancy_agreement_path` |
| 61 | 49 document-related tests | Feature tests |

---

### Mobile App — React Native / Expo (85%)

| # | Feature | Notes |
|---|---------|-------|
| 62 | Landlord screens | Dashboard, Properties, PropertyDetails, Units, Tenants, TenantDetails, TenancyUtilities, Payments, UtilityBills, Profile |
| 63 | Tenant screens | Dashboard, Payments, MakePayment, Utilities, UtilityBills, Profile, Documents |
| 64 | Sanctum authentication with permanent tokens | Per-device tokens |
| 65 | Premium splash screen with background loading | Zero-flicker transition |
| 66 | Bottom tabs + nested stack navigation | Role-based |
| 67 | Rent billing screens | View/pay rent bills, link payments, waive bills |
| 68 | Push notifications | Expo push channel integration |
| 69 | Document screens | Upload (landlord), download (tenant) |

---

### Landing Page (60%)

| # | Feature | Notes |
|---|---------|-------|
| 70 | 9-section editorial landing page | Bento grid pain-solution, animations, responsive |
| 71 | Bento grid shared token model | `accentColor`, `size`, `sizeClasses`, hover radial gradients |
| 72 | Welcome page replaced with `home.tsx` | Wayfinder routes updated |

---

### API & Infrastructure

| # | Feature | Notes |
|---|---------|-------|
| 73 | Strict API versioning (`/api/v1/`) | 81 active routes, unversioned removed |
| 74 | Eloquent API Resources for all endpoints | `{ data: ..., meta: ... }` wrapping |
| 75 | Service layer architecture | 14+ services implementing contracts for DI |
| 76 | Queue worker in production | Added to `start.sh` |
| 77 | `migrate:fresh` in CI | Verifies migration ordering |
| 78 | Sentry error tracking | Production monitoring |
| 79 | Redis as production driver | phpredis in Dockerfile |
| 80 | Docker + Render deployment | Reproducible builds |
| 81 | Glassmorphism UI | shadcn-glass-ui + Tailwind v4 |
| 82 | Dark/light theming | `next-themes` |
| 83 | Test suite: 512 tests, 1561 assertions | Pest 4, architecture tests, smoke tests |
| 84 | Cross-ownership 403 authorization tests | All API controller groups |

---

## ⚠️ Partially Complete

These features have a working core but have documented remaining work items.

### Document Storage — Enhancements

| # | Feature | Status |
|---|---------|--------|
| 85 | S3 disk integration for production | ⬜ Not started |
| 86 | Document preview (PDF viewer modal) | ⬜ Not started |
| 87 | Drag-and-drop / bulk upload | ⬜ Not started |
| 88 | Document versioning and expiration dates | ⬜ Not started |
| 89 | Attach documents to Payment and Property models | ⬜ Not started (schema supports it) |

### Analytics — Remaining

| # | Feature | Status |
|---|---------|--------|
| 90 | Overdue bills aging report | ⬜ Not started |
| 91 | Tenant payment reliability score | ⬜ Not started |

### Notification — Remaining

| # | Feature | Status |
|---|---------|--------|
| 92 | Notification preferences per user (channel opt-in/out) | ⬜ Not started |
| 93 | Notification template system | ⬜ Not started |
| 94 | Delivery status tracking (sent, delivered, read) | ⬜ Not started |
| 95 | Scheduled digest emails/WhatsApp summaries | ⬜ Not started |
| 96 | Landlord-to-tenant broadcast messages | ⬜ Not started |

### Landing Page & Onboarding — Remaining

| # | Feature | Status |
|---|---------|--------|
| 97 | Landlord onboarding flow (create account → add first property → add first unit) | ⬜ Not started |
| 98 | Tenant self-registration flow (mobile) — refine existing | ⬜ Not started |
| 99 | Email verification on registration | ⬜ Not started (Fortify supports, needs enabling) |
| 100 | "Forgot password" flow polish | ⬜ Not started |
| 101 | Footer links, pricing section | ⬜ Not started |

### Security & Operational

| # | Feature | Status |
|---|---------|--------|
| 102 | Security event logging (password changes, new device login, profile updates, role changes) | ⬜ Incomplete — model exists, not wired everywhere |
| 103 | `LandlordVerified` event wiring | ⬜ Not wired |
| 104 | `SystemError` automatic trigger from exception handler | ⬜ Not wired |
| 105 | PDF receipt streaming restoration (lost in merge conflict) | ⬜ Pending fix |
| 106 | API-mobile data inconsistency (Utilities, Properties, Units endpoints) | ⬜ Periodic auditing needed |

### Frontend — Rent Bills Pages

| # | Feature | Status |
|---|---------|--------|
| 107 | Landlord rent bills list page (`landlord/rent-bills/index.tsx`) | ⬜ Routes exist, page not created |
| 108 | Landlord rent bill detail page (`landlord/rent-bills/show.tsx`) | ⬜ Routes exist, page not created |
| 109 | Tenant rent bills list page (`tenant/rent-bills/index.tsx`) | ⬜ Routes exist, page not created |
| 110 | Tenant rent bill detail page (`tenant/rent-bills/show.tsx`) | ⬜ Routes exist, page not created |

---

## 🔧 Scaffolded (Not Activated)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 111 | Payment gateway layer | Scaffolded, **not registered** | `PaymentGatewayServiceProvider` exists but not in `bootstrap/providers.php` |
| 112 | M-Pesa STK push initiation | ⬜ Endpoint not implemented | Scaffold only |
| 113 | M-Pesa callback handler (`MpesaWebhookController`) | ⬜ Not implemented | Scaffold only |
| 114 | `PaymentConfirmed` event → `ProcessPaymentConfirmed` listener chain | ⬜ Not tested end-to-end | Events/listeners scaffolded |
| 115 | `routes/webhooks.php` | ⬜ Not wired into `bootstrap/app.php` | File exists |
| 116 | Mobile payment initiation in `MakePaymentScreen` | ⬜ Not integrated | Awaits gateway activation |
| 117 | Gateway payment status tracking in mobile history | ⬜ Not built | Awaits gateway activation |

---

## 🚫 Not Started

### Maintenance Requests (0%)

| # | Feature | Status |
|---|---------|--------|
| 118 | Design maintenance request schema | ⬜ |
| 119 | Tenant: submit request with description + optional photo | ⬜ |
| 120 | Landlord: view, update status, add notes | ⬜ |
| 121 | Status machine: submitted → in_progress → resolved → closed | ⬜ |
| 122 | Notification on status change | ⬜ |

### Backlog (Not Scheduled)

| # | Feature | Status |
|---|---------|--------|
| 123 | Lease renewal workflows with automated reminders | ⬜ |
| 124 | Expense tracking for landlords (repairs, utilities, taxes) | ⬜ |
| 125 | Tenant screening and application pipeline | ⬜ |
| 126 | Multi-currency support | ⬜ |
| 127 | Multi-region / multi-language support | ⬜ |
| 128 | Integration with accounting software (QuickBooks, Xero) | ⬜ |
| 129 | Bulk operations (bill generation, payment recording) | ⬜ |
| 130 | API rate limiting per tenant/landlord | ⬜ |
| 131 | Security event dashboard for admins | ⬜ |
| 132 | Notification retention policy (auto-cleanup old notifications) | ⬜ |
| 133 | Failed job alerting for queued notifications | ⬜ |
| 134 | Multi-property portfolio management with aggregated metrics | ⬜ |
| 135 | Automated reminders and escalation for overdue bills | ⬜ |

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Complete | 84 features |
| ⚠️ Partially complete (remaining items) | 30 items pending |
| 🔧 Scaffolded, not activated | 7 items |
| 🚫 Not started | 18 features |
| **Total** | **139 feature items** |

| Area | Completion |
|------|-----------|
| Authentication & Authorization | 95% |
| Property & Unit Management | 95% |
| Tenant & Tenancy Management | 95% |
| Billing (Rent + Utilities) | 90% |
| Payments & Receipts | 95% |
| Notifications | 95% |
| Analytics & Reporting | 80% |
| Document Storage | 90% |
| Mobile App | 85% |
| Landing & Onboarding | 60% |
| CSV Bulk Import | 100% |
| Payment Gateway | Scaffolded only |
| Maintenance Requests | 0% |
