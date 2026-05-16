# Vision

## Product Vision

Estate Practice is a **property management platform that connects landlords and tenants through a unified web and mobile experience**. It eliminates the friction of rent collection, utility tracking, and tenancy management by providing a single system of record for all parties involved.

The end state is a **self-operating property management tool** where bills generate automatically, payments flow through integrated gateways, notifications keep everyone informed, and landlords get real-time visibility into their portfolio health — all without manual intervention.

---

## Target Users

### Landlord

**Who they are:** Property owners and managers running 1–100+ units. Often solo operators or small teams. They wear every hat — accountant, maintenance coordinator, tenant relations, and legal liaison.

**What they need:**

- **Instant portfolio visibility** — A dashboard that answers "how is my business doing?" in under 5 seconds. Occupancy rate, revenue collected vs. expected, overdue bills, and upcoming lease expirations at a glance.
- **Effortless rent collection** — Bills generate automatically. Tenants pay via mobile money. The landlord sees confirmed payments without chasing anyone.
- **Zero manual billing** — Rent and utility bills created on schedule. No spreadsheets, no forgotten units, no "did I send this month's bill?"
- **Tenant lifecycle control** — Onboard a tenant in one flow (create record → assign unit → set rent → auto-generate credentials). End a tenancy cleanly with unit status auto-updating.
- **Maintenance oversight** — See what tenants have reported, track resolution status, and have a record of everything — no more "you never told me about that."
- **Documented paper trail** — Leases, receipts, inspection photos, and payment records stored and retrievable. Audit-ready without effort.
- **Multi-channel communication** — Reach tenants via WhatsApp, push notification, or email. Broadcast messages to all tenants in a property or target specific ones.
- **Bulk operations** — Import an existing portfolio from Excel. Generate bills for all units at once. Export financial reports for tax season.

### Tenant

**Who they are:** People renting residential or commercial units. They want a frictionless experience — see what they owe, pay it, and move on.

**What they need:**

- **Clear billing visibility** — Know exactly what they owe, what they've paid, and what's coming next. No surprise charges, no ambiguity.
- **One-tap payments** — Pay rent and utilities from their phone via mobile money. Get instant confirmation and a downloadable receipt.
- **Payment history** — A complete record of every payment they've made. Useful for disputes, tax records, and personal budgeting.
- **Timely notifications** — Get reminded before a bill is due. Get confirmed when a payment clears. Get notified when maintenance status changes.
- **Maintenance reporting** — Submit a maintenance request with a photo from their phone. Track its progress without calling or texting the landlord.
- **Document access** — View and download their lease, receipts, and any documents the landlord has shared.
- **Self-service profile management** — Update contact info, change password, enable 2FA — without needing the landlord to do it for them.

### Admin

**Who they are:** System operators who keep the platform running. They manage user accounts, resolve disputes, and ensure data integrity.

**What they need:**

- **Full system oversight** — See all users, properties, tenancies, and payments across the entire platform.
- **User lifecycle management** — Create, suspend, or delete user accounts. Reset credentials. Toggle account status.
- **Intervention capability** — Step into any landlord-tenant relationship to resolve disputes, correct data, or override settings when needed.
- **Security audit trail** — Every login, password change, profile update, and sensitive operation logged. Know who did what and when.
- **Platform health monitoring** — Track system performance, queue backlogs, failed notification deliveries, and error rates.
- **Configuration control** — Manage utility type catalogs, notification templates, system-wide settings, and feature flags.

---

## Problems We Solve

| Pain Point | Headline | Solutions |
|------------|----------|-----------|
| **Data overload** | "Less chaos. More control. All in one place." | Investor-grade dashboards + clean data visualizations |
| **Workload anxiety** | "Your business, on autopilot." | Automated workflows + intelligent task scheduling |
| **Financial leakage** | "Every tenant, every unit, every cent — finally under control." | Integrated mobile payment gateways + automated bank reconciliation + professional financial reports |
| **Communication chaos** | "No more missed messages." | Centralized multi-channel hub (in-app, push notifications, email logs) |
| **Maintenance reporting and management** | "Report it. Track it. Fix it." | Photo-verified tenant reporting + automated vendor dispatch + asset lifecycle tracking |
| **Transition and onboarding friction** | "Switch in minutes. Not months." | One-click Excel migration + automated data mapping + instant portfolio import |

---

## Product Goals

### Near-Term (Current Phase)
- [x] Role-based access control with type-safe enum authorization
- [x] Property, unit, tenant, and tenancy CRUD
- [x] Automated rent and utility bill generation
- [x] Payment recording and status tracking
- [x] Multi-channel notifications (WhatsApp, Expo push)
- [x] PDF receipt generation
- [x] Mobile app with landlord and tenant screens
- [x] API strict versioning (`/api/v1/`)
- [x] Comprehensive test suite (348+ tests)

### Mid-Term
- [ ] Activate payment gateway layer (M-Pesa STK push + manual gateway)
- [ ] Landing page and public-facing marketing site
- [ ] Tenant and landlord onboarding flows
- [ ] Document storage (leases, receipts, inspection photos)
- [ ] Maintenance request workflow
- [ ] Automated reminders and escalation for overdue bills
- [ ] Dashboard analytics and reporting

### Long-Term
- [ ] Multi-property portfolio management with aggregated metrics
- [ ] Lease renewal workflows and automated reminders
- [ ] Expense tracking for landlords
- [ ] Tenant screening and application pipeline
- [ ] Integration with accounting software
- [ ] Multi-currency and multi-region support

---

## What Estate Practice Is NOT

These are explicit **non-goals**. If a feature request falls into one of these categories, it is out of scope unless the vision itself is revised.

| Non-Goal | Reason |
|----------|--------|
| **A full accounting system** | We track payments and bills, not general ledger, invoicing, tax filing, or bookkeeping. |
| **A property listing / marketplace** | We are not Zillow or Airbnb. We manage existing tenancies, not property discovery or short-term rentals. |
| **A smart home / IoT platform** | We do not integrate with smart locks, thermostats, or building automation systems. |
| **A construction / facility management tool** | Maintenance requests are lightweight. We are not managing contractors, work orders, or capital improvements. |
| **A tenant social network** | Tenants interact with the system, not with each other. No forums, messaging between tenants, or community features. |
| **An enterprise ERP** | We target individual landlords and small-to-medium property managers, not corporate real estate portfolios with hundreds of employees. |
| **A legal / compliance engine** | We do not provide legal advice, lease template generation, or regulatory compliance checking. |

---

## Guiding Principles

1. **Automation over manual work** — If something can be scheduled, it should be. Bills, reminders, status updates — all automated.

2. **Type safety everywhere** — The `Role` enum set the precedent. No string literals for domain concepts. TypeScript on the frontend, PHP enums on the backend.

3. **Mobile-first for tenants** — Tenants will primarily interact via the mobile app. The web app is landlord/admin focused.

4. **Clear ownership boundaries** — Landlords only see their properties. Tenants only see their data. Policies enforce this at every layer.

5. **Auditability** — Every payment, status change, and security event is logged. The system should answer "who did what and when" without guesswork.

6. **Progressive enhancement** — Core features work without payment gateways. Gateway integration is an enhancement, not a prerequisite.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Test coverage | 100% passing, growing with each feature |
| API contract stability | No breaking changes within `/api/v1/` |
| Mobile app stability | Zero crashes on core payment flow |
| Bill-to-payment cycle time | < 24h from bill generation to payment confirmation (when gateway is active) |
| Time to onboard a new tenant | < 2 minutes from form submission to active tenancy |
