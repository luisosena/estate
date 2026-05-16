# Roadmap

> **Single source of truth** for what needs to be built, in what order, and where we stand.
> Updated in place as work progresses.

---

## Current Status

**Active branch:** `port/payment-architecture`
**Last updated:** 2026-05-16

### Milestone Completion Overview

| Milestone | Status | Notes |
|-----------|--------|-------|
| Core authentication & role-based access | ✅ Complete | Fortify + Sanctum, `Role` enum, Policies |
| Property, unit, tenant, tenancy CRUD | ✅ Complete | Full lifecycle management |
| Automated billing (rent + utilities) | ✅ Complete | Scheduled commands, status tracking |
| Payment recording & receipt generation | ✅ Complete | DomPDF, multi-channel notifications |
| Mobile app (React Native/Expo) | ✅ Complete | Landlord + tenant screens |
| API strict versioning (`/api/v1/`) | ✅ Complete | Unversioned routes removed |
| Test suite | ✅ Complete | 348 tests, 1133 assertions |
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
| Design and implement landing page (`/`) | ⬜ | Replace current `welcome.tsx` |
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
| Design document schema (`documents` table) | ⬜ | |
| File upload endpoint with validation | ⬜ | |
| Document association (tenancy, payment, property) | ⬜ | |
| Document listing and download UI (web + mobile) | ⬜ | |
| Access control via Policies | ⬜ | |

**Definition of done:** Landlord can upload a lease PDF to a tenancy; tenant can view and download it from mobile.

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
| Notification preferences per user (channel opt-in/out) | ⬜ | |
| Notification template system (bill reminders, payment confirmations, etc.) | ⬜ | |
| Delivery status tracking (sent, delivered, read) | ⬜ | |
| In-app notification inbox with mark-as-read | ⬜ | |
| Scheduled digest emails/WhatsApp summaries | ⬜ | Weekly or monthly |
| Landlord-to-tenant broadcast messages | ⬜ | Property-wide or tenancy-specific |

**Definition of done:** Users can control which channels they receive notifications on, view all notifications in-app, and landlords can send broadcast messages to their tenants.

---

### Dashboard Analytics & Reporting

**Goal:** Give landlords actionable insights into their portfolio.

| Task | Status | Notes |
|------|--------|-------|
| Occupancy rate over time | ⬜ | |
| Revenue collected vs. expected (monthly) | ⬜ | |
| Overdue bills aging report | ⬜ | |
| Tenant payment reliability score | ⬜ | |
| Export reports (CSV/PDF) | ⬜ | |

**Definition of done:** Landlord dashboard shows charts for occupancy, revenue, and overdue bills with date range filters.

---

## Backlog (Not Yet Scheduled)

These are validated ideas that have not been assigned to a phase.

- [ ] Automated reminders and escalation for overdue bills (SMS/WhatsApp)
- [ ] Lease renewal workflows with automated reminders
- [ ] Expense tracking for landlords (repairs, utilities, taxes)
- [ ] Tenant screening and application pipeline
- [ ] Multi-currency support
- [ ] Multi-region / multi-language support
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Bulk operations (bill generation, payment recording)
- [ ] API rate limiting per tenant/landlord
- [ ] Security event dashboard for admins

---

## Progress Tracking

### By Area

| Area | Completion | Notes |
|------|-----------|-------|
| Authentication & Authorization | 95% | 2FA, role enum, policies done. Session management could improve. |
| Property & Unit Management | 90% | CRUD complete. Analytics pending. |
| Tenant & Tenancy Management | 90% | CRUD complete. Onboarding flow pending. |
| Billing (Rent + Utilities) | 85% | Auto-generation works. Gateway integration pending. |
| Payments | 70% | Recording works. Gateway activation pending. |
| Notifications | 80% | Channels ported. Event wiring needs testing. |
| Receipts | 90% | Generation works. Storage optimization possible. |
| Mobile App | 75% | Core screens done. Payment gateway integration pending. |
| Testing | 85% | 348 tests passing. Gateway flow tests pending. |
| Documentation | 70% | Technical docs solid. Vision/roadmap now added. |
| Landing & Onboarding | 10% | Basic welcome page exists. Full flow pending. |
| Document Storage | 0% | Not started. |
| Maintenance Requests | 0% | Not started. |
| Analytics & Reporting | 10% | Dashboard cards exist. Charts are placeholder data. |

### Overall Project Completion

```
[████████████████████░░░░░░░░░░] ~65%
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
| 2026-05-15 | Event wiring and mobile types updated (Phase 5) |
| 2026-05-16 | Vision and roadmap documentation created |
