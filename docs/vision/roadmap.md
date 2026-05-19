# Roadmap

> **Single source of truth** for what needs to be built, in what order, and where we stand.
> Updated in place as work progresses.

---

## Current Status

**Active branch:** `message-and-notification`
**Last updated:** 2026-05-19

### Milestone Completion Overview

| Milestone | Status | Notes |
|-----------|--------|-------|
| Core authentication & role-based access | ✅ Complete | Fortify + Sanctum, `Role` enum, Policies |
| Property, unit, tenant, tenancy CRUD | ✅ Complete | Full lifecycle management |
| Automated billing (rent + utilities) | ✅ Complete | Scheduled commands, status tracking |
| Payment recording & receipt generation | ✅ Complete | On-demand PDF streaming, multi-channel notifications |
| Document storage system | ✅ Complete | Polymorphic attachments, web + mobile UI, 49 tests, soft deletes |
| Mobile app (React Native/Expo) | ✅ Complete | Landlord + tenant screens + document support + push notifications |
| API strict versioning (`/api/v1/`) | ✅ Complete | Unversioned routes removed |
| Test suite | ✅ Complete | 483 tests, 1428 assertions |
| Notification system | ✅ Complete | 10 notification types, 5 channels (database, mail, WhatsApp, Expo push, WebSocket broadcast), admin notifications, real-time toast, push token management |
| Analytics & reporting | ✅ Complete | Revenue charts, payment collection charts, CSV/PDF exports, admin audit reports |
| Landing page | ✅ Complete | 9-section editorial redesign with bento grid, animations, responsive |
| Payment gateway layer | ⚠️ Scaffolded | Wired but not activated |

---

## Upcoming Work

### Activate Payment Gateway

**Goal:** Enable the scaffolded payment gateway layer so tenants can pay via M-Pesa STK push.

| Task | Status | Notes |
|------|--------|-------|
| Register `PaymentGatewayServiceProvider` in `bootstrap/providers.php` | ⬜ | |
| Wire `routes/webhooks.php` into `bootstrap/app.php` | ⬜ | |
| Implement M-Pesa STK push initiation endpoint | ⬜ | |
| Implement M-Pesa callback handler (`MpesaWebhookController`) | ⬜ | |
| Test `PaymentConfirmed` event → `ProcessPaymentConfirmed` listener chain end-to-end | ⬜ | |
| Mobile: integrate payment initiation flow in `MakePaymentScreen` | ⬜ | |
| Add gateway payment status tracking to mobile payment history | ⬜ | |

**Definition of done:** Tenant can initiate M-Pesa payment from mobile, receive STK push, complete payment, and see confirmed status with auto-generated receipt.

---

### Landing Page & Onboarding

**Goal:** Public-facing landing page and streamlined onboarding for new landlords and tenants.

| Task | Status | Notes |
|------|--------|-------|
| Design and implement landing page (`/`) | ✅ Complete | 9-section page with bento grid pain-solution, animations, responsive design |
| Bento grid refactor | ✅ Complete | Shared token model (`accentColor`, `size`), `sizeClasses` map, hover radial gradients |
| Welcome page removal | ✅ Complete | Old animated splash replaced with `home.tsx`, Wayfinder routes updated |
| Landlord onboarding flow (create account → add first property → add first unit) | ⬜ | |
| Tenant self-registration flow (mobile) — refine existing | ⬜ | |
| Email verification on registration | ⬜ | Fortify supports this, needs enabling |
| "Forgot password" flow polish | ⬜ | |

**Definition of done:** A visitor can land on the site, understand the product, sign up as a landlord, and have their first property ready to accept tenants within 5 minutes.

---

### Excel Onboarding

**Goal:** Allow landlords to bulk-import existing data (properties, units, tenants, tenancies, payment history) from Excel spreadsheets.

| Task | Status | Notes |
|------|--------|-------|
| Excel template download (pre-formatted with required columns) | ⬜ | |
| File upload and parsing (`phpoffice/phpspreadsheet` or similar) | ⬜ | |
| Data validation with row-level error reporting | ⬜ | |
| Preview before import (dry run) | ⬜ | |
| Import execution with transaction rollback on failure | ⬜ | |
| Auto-create user accounts for imported tenants | ⬜ | |
| Import history and audit log | ⬜ | |

**Definition of done:** Landlord downloads template, fills in their existing portfolio data, uploads it, reviews any errors, and completes the import with all records created correctly.

---

### Document Storage

**Goal:** Allow landlords and tenants to upload and access documents (leases, receipts, inspection photos).

| Task | Status | Notes |
|------|--------|-------|
| Design document schema (`documents` table) | ✅ Complete | Polymorphic morphTo, soft deletes, composite indexes |
| File upload endpoint with validation | ✅ Complete | MIME + size validation, UUID paths, `config/documents.php` |
| Document association (tenancy, payment, property) | ✅ Complete | `documentable` polymorphic relationship, `OnboardingService` integration |
| Document listing and download UI (web + mobile) | ✅ Complete | Landlord tenant show page, tenant `/documents` page, mobile screens with `expo-document-picker` |
| Access control via Policies | ✅ Complete | `DocumentPolicy` with role-based access, N+1-free ownership checks |

**Definition of done:** Landlord can upload a lease PDF to a tenancy; tenant can view and download it from mobile. ✅ **Achieved.**

**Implementation details:** See [`docs/reports/document-storage-implementation-report.md`](../reports/document-storage-implementation-report.md)

**Remaining enhancements:**
- [ ] S3 disk integration for production
- [ ] Document preview (PDF viewer modal)
- [ ] Drag-and-drop / bulk upload
- [ ] Document versioning and expiration dates
- [ ] Attach documents to Payment and Property models (not just Tenancy)

---

### Maintenance Requests

**Goal:** Tenants can submit maintenance requests; landlords can track and update status.

| Task | Status | Notes |
|------|--------|-------|
| Design maintenance request schema | ⬜ | |
| Tenant: submit request with description and optional photo | ⬜ | |
| Landlord: view, update status, add notes | ⬜ | |
| Status machine: submitted → in_progress → resolved → closed | ⬜ | |
| Notification on status change | ⬜ | |

**Definition of done:** Tenant submits a maintenance request from mobile; landlord sees it on dashboard, updates status, tenant gets notified.

---

### Notification & Messaging

**Goal:** Expand the notification layer into a full messaging system with preferences, templates, and delivery tracking.

| Task | Status | Notes |
|------|--------|-------|
| Core notification system (10 types, 5 channels) | ✅ Complete | Database, mail, WhatsApp, Expo push, WebSocket broadcast |
| Admin notification system | ✅ Complete | New landlords, verifications, tenancy summaries, system errors |
| Real-time toast notifications (Reverb) | ✅ Complete | `use-real-time-notifications` hook, Echo integration |
| Push token management API | ✅ Complete | Register/remove endpoints, token auto-clear on DeviceNotRegistered |
| In-app notification inbox (all 3 roles) | ✅ Complete | Web + API, pagination, filters, mark read/unread |
| Notification preferences per user (channel opt-in/out) | ⬜ | |
| Notification template system (bill reminders, payment confirmations, etc.) | ⬜ | |
| Delivery status tracking (sent, delivered, read) | ⬜ | |
| Scheduled digest emails/WhatsApp summaries | ⬜ | Weekly or monthly |
| Landlord-to-tenant broadcast messages | ⬜ | Property-wide or tenancy-specific |

**Definition of done:** ~~Users can control which channels they receive notifications on, view all notifications in-app, and landlords can send broadcast messages to their tenants.~~ ✅ Core system complete. Remaining: preferences, templates, broadcast messages.

**Implementation details:** See [`docs/reports/notification-messaging-implementation.md`](../reports/notification-messaging-implementation.md)

**Code review fixes applied (May 2026):**
- Push token fields added to `User::$hidden` to prevent API leakage
- `title`/`priority` keys added to all notification `toArray()` methods
- Route ordering fixed for push-token endpoints
- `markAsUnread` API routes added for web/mobile parity
- `ManagesNotifications` trait extracted to eliminate controller duplication (3 → 1)
- Laravel paginator replaces manual skip/take in API controllers
- 10 feature tests added for notification endpoints

---

### Dashboard Analytics & Reporting

**Goal:** Give landlords actionable insights into their portfolio.

| Task | Status | Notes |
|------|--------|-------|
| Revenue trend charts (Recharts AreaChart) | ✅ Complete | `RevenueAnalyticsService`, 12-month rolling, cross-database compatible |
| Payment collection breakdown (stacked BarChart) | ✅ Complete | Paid/pending/overdue/partial/waived status breakdown |
| Occupancy rate standardization | ✅ Complete | Unified formula across all services (distinct units with active tenancies) |
| Overdue bills aging report | ⬜ | |
| Tenant payment reliability score | ⬜ | |
| Export reports (CSV/PDF) | ✅ Complete | Streamed CSV, DomPDF templates, role-gated, unified 50-record limit |
| Admin audit reports page | ✅ Complete | 4-section grid: registrations, properties, tenancies, payments |

**Definition of done:** ~~Landlord dashboard shows charts for occupancy, revenue, and overdue bills with date range filters.~~ ✅ Charts, exports, and audit reports complete. Remaining: aging report, reliability score.

**Implementation details:** See [`docs/reports/analytics-and-reporting-implementation.md`](../reports/analytics-and-reporting-implementation.md)

**Code review fixes applied (May 2026):**
- 3-query ID-gather pattern extracted to `User::getTenancyIds()` with subquery chaining
- In-memory aggregation pushed to database with `selectRaw()` + `groupByRaw()`
- `occupied_units` computed and used in frontend occupancy formula
- Audit queries moved from controller to `AdminDashboardService`
- `waived` bills added to PaymentCollectionChart
- CSV/PDF export limits unified to 50 records
- 10 new tests added across 2 test files

---

## Backlog (Not Yet Scheduled)

These are validated ideas that have not been assigned to a phase.

- [ ] Lease renewal workflows with automated reminders
- [ ] Expense tracking for landlords (repairs, utilities, taxes)
- [ ] Tenant screening and application pipeline
- [ ] Multi-currency support
- [ ] Multi-region / multi-language support
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Bulk operations (bill generation, payment recording)
- [ ] API rate limiting per tenant/landlord
- [ ] Security event dashboard for admins
- [ ] Notification retention policy (auto-cleanup old notifications)
- [ ] Failed job alerting for queued notifications
- [ ] `LandlordVerified` event wiring
- [ ] `SystemError` automatic trigger from exception handler
- [ ] PDF receipt merge audit fix (restore streaming version from `landing-page` branch)

---

## Progress Tracking

### By Area

| Area | Completion | Notes |
|------|-----------|-------|
| Authentication & Authorization | 95% | 2FA, role enum, policies done. Session management could improve. |
| Property & Unit Management | 95% | CRUD complete. Analytics and charts integrated. |
| Tenant & Tenancy Management | 90% | CRUD complete. Onboarding flow pending. |
| Billing (Rent + Utilities) | 90% | Auto-generation works, notifications wired. Gateway integration pending. |
| Payments | 70% | Recording works, receipt streaming works. Gateway activation pending. |
| Notifications | 95% | Full system complete (10 types, 5 channels, real-time). Preferences and templates pending. |
| Receipts | 95% | On-demand streaming works. |
| Mobile App | 85% | Core screens + document support + push notifications done. Payment gateway integration pending. |
| Testing | 95% | 483 tests passing. Gateway flow tests pending. |
| Documentation | 85% | Technical docs, vision/roadmap, implementation reports all current. |
| Landing & Onboarding | 60% | Full landing page with bento grid implemented. Footer links, pricing, onboarding flows pending. |
| Document Storage | 90% | Core system complete. S3 integration and enhancements pending. |
| Analytics & Reporting | 80% | Charts, exports, audit reports complete. Aging report and reliability score pending. |
| Maintenance Requests | 0% | Not started. |

### Overall Project Completion

```
[█████████████████████████░░░] ~82%
```

---

## Historical Notes

| Date | Event |
|------|-------|
| 2026-01-14 | Project initialized |
| 2026-02-20 | Tenant CRUD and tenancy management complete |
| 2026-03-14 | Utility system refactored to three-table pattern |
| 2026-03-20 | Notification channels (WhatsApp, Expo) ported |
| 2026-04-14 | Rent billing system complete |
| 2026-04-25 | Payment gateway scaffold (Phase 3) complete |
| 2026-05-10 | Receipt generation (Phase 4) complete |
| 2026-05-12 | Week 2 structural safety review (policies, FK constraints) |
| 2026-05-15 | Event wiring and mobile types updated (Phase 5) |
| 2026-05-16 | Vision and roadmap documentation created |
| 2026-05-17 | Document storage system complete (Phase 6) — 39 files, 49 tests, web + mobile UI |
| 2026-05-17 | Notification system overhaul — 10 notification types, 5 channels, admin notifications, Reverb real-time, push tokens |
| 2026-05-17 | Landing page editorial redesign — 9-section page with bento grid pain-solution section |
| 2026-05-17 | Post-merge audit: PDF receipt refactor lost during conflict resolution (documented, pending fix) |
| 2026-05-19 | Analytics & reporting complete — revenue charts, payment collection charts, CSV/PDF exports, admin audit reports |
| 2026-05-19 | Notification system code review fixes — trait extraction, paginator, push token hiding, markAsUnread, 10 new tests |
