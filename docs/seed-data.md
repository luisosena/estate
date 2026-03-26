# Seed Data Reference

> **Source of truth**: [`database/seeders/DevelopmentSeeder.php`](../database/seeders/DevelopmentSeeder.php)
> Run: `php artisan db:seed` (truncates all tables and re-seeds)

---

## Password Convention

> [!IMPORTANT]
> **Password = Username** for every seeded account. This applies to all roles.
> Passwords are bcrypt-hashed in the DB. The plain-text value is the username string.

---

## 1. User Accounts

| Role | Name | Username | Email | Password |
|------|------|----------|-------|----------|
| admin | System Administrator | `admin` | admin@estatemanager.co.tz | `admin` |
| landlord | Wanjiku Kamau | `wanjiku.kamau` | wanjiku.kamau@estatemanager.co.tz | `wanjiku.kamau` |
| landlord | Hassan Omar | `hassan.omar` | hassan.omar@estatemanager.co.tz | `hassan.omar` |
| tenant | Amina Juma Salim | `amina.salim` | amina.salim@gmail.com | `amina.salim` |
| tenant | Bernard Omondi | `bernard.omondi` | bernard.omondi@gmail.com | `bernard.omondi` |
| tenant | Fatuma Rashid | `fatuma.rashid` | fatuma.rashid@yahoo.com | `fatuma.rashid` |
| tenant | David Mwangi Kariuki | `david.mwangi` | david.mwangi@outlook.com | `david.mwangi` |
| tenant | Zainab Mohammed Ali | `zainab.ali` | zainab.ali@gmail.com | `zainab.ali` |

**Key field notes (users table):**
- `tenant_id` — FK to `tenants.id`, populated only for role=tenant users
- `role` — ENUM: `admin`, `landlord`, `tenant`
- `password` — bcrypt hash; plain-text = username

---

## 2. Tenants

| Code | Full Name | Phone | Emergency Contact |
|------|-----------|-------|------------------|
| TNT-2026-001 | Amina Juma Salim | +255754123456 | Juma Salim (Father) |
| TNT-2026-002 | Bernard Omondi | +255653234567 | Grace Omondi (Wife) |
| TNT-2026-003 | Fatuma Rashid | +255712345678 | Rashid Khalid (Husband) |
| TNT-2026-004 | David Mwangi Kariuki | +255785456789 | Susan Kariuki (Sister) |
| TNT-2026-005 | Zainab Mohammed Ali | +255622567890 | Mohammed Ali (Brother) |

**Key field notes (tenants table):**
- `tenant_code` — unique, format `TNT-YYYY-NNN`
- `full_name` — single field (not split first/last)
- `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation` — three separate columns
- Soft-deletes enabled (`deleted_at`)

### Tenant Identifications

| Tenant | ID Type | ID Number | Verified |
|--------|---------|-----------|---------|
| Amina Salim | national_id | TZ-NID-19870321-001 | ✅ |
| Bernard Omondi | passport | KE-PP-A4521876 | ✅ |
| Fatuma Rashid | national_id | TZ-NID-19900615-003 | ✅ |
| David Mwangi | drivers_license | TZ-DL-2019-00445 | ✅ |
| Zainab Ali | national_id | TZ-NID-19951120-005 | ✅ |

---

## 3. Properties

| Owner | Property Name | City | Type | Units |
|-------|---------------|------|------|-------|
| Wanjiku Kamau | Msasani Pearl Apartments | Dar es Salaam | apartment | 4 |
| Wanjiku Kamau | Kinondoni Garden Flats | Dar es Salaam | apartment | 3 |
| Hassan Omar | Arusha Heights Residences | Arusha | house | 3 |

---

## 4. Units

| Unit Code | Property | Name | Status |
|-----------|----------|------|--------|
| MSN-A101 | Msasani Pearl | Ground Floor Studio | occupied |
| MSN-A102 | Msasani Pearl | Ground Floor 1-Bedroom | occupied |
| MSN-A201 | Msasani Pearl | First Floor 2-Bedroom | occupied |
| MSN-A202 | Msasani Pearl | First Floor 2-Bedroom | **available** |
| KND-B101 | Kinondoni Garden | Ground Floor 1-Bedroom | occupied |
| KND-B102 | Kinondoni Garden | Ground Floor 2-Bedroom | occupied |
| KND-B201 | Kinondoni Garden | First Floor 2-Bedroom | **available** |
| ARU-C001 | Arusha Heights | House 1 – 3-Bedroom | occupied |
| ARU-C002 | Arusha Heights | House 2 – 2-Bedroom | occupied |
| ARU-C003 | Arusha Heights | House 3 – 3-Bedroom | **available** |

**Key field notes (units table):**
- `unit_code` — UNIQUE, format `PPP-UNNN`
- `unit_name` — human-readable label
- `status` — ENUM: `available`, `occupied`

---

## 5. Tenancies

| Tenant | Unit | Move-in | Monthly Rent (TZS) | Deposit (TZS) | Status |
|--------|------|---------|-------------------|----------------|--------|
| Amina Salim | MSN-A101 | 2025-08-01 | 450,000 | 900,000 | active |
| Bernard Omondi | MSN-A102 | 2025-10-01 | 600,000 | 1,200,000 | active |
| Fatuma Rashid | MSN-A201 | 2025-06-15 | 850,000 | 1,700,000 | active |
| David Mwangi | KND-B101 | 2025-09-01 | 550,000 | 1,100,000 | active |
| Zainab Ali | ARU-C001 | 2025-11-01 | 700,000 | 1,400,000 | active |

**Key field notes (tenancies table):**
- `move_in_date` / `move_out_date` — actual column names (not `start_date`/`end_date`)
- `monthly_rent` — the rent per the tenancy agreement (may differ from unit's list price)
- `status` — ENUM: `active`, `ended`

---

## 6. Utility Types

| Name | Unit | Metered |
|------|------|---------|
| Water | cubic metres | ✅ |
| Electricity | kWh | ✅ |
| Gas | cubic metres | ✅ |
| Internet | flat rate | ❌ |
| Security | flat rate | ❌ |
| Janitor | flat rate | ❌ |
| Garbage | flat rate | ❌ |
| Parking | flat rate | ❌ |

---

## 7. Tenancy Utilities

Each active tenancy has the following utilities configured:

| Tenant | Utility | Amount/mo (TZS) | Provider |
|--------|---------|----------------|---------|
| Amina | Water | 32,000 | DAWASA |
| Amina | Electricity | 68,000 | TANESCO |
| Amina | Internet | 45,000 | Zuku Fibre |
| Amina | Security | 25,000 | Msasani Pearl Mgt |
| Bernard | Water | 38,000 | DAWASA |
| Bernard | Electricity | 92,000 | TANESCO |
| Bernard | Internet | 45,000 | Zuku Fibre |
| Bernard | Garbage | 8,000 | Dar Clean Services |
| Fatuma | Water | 55,000 | DAWASA |
| Fatuma | Electricity | 145,000 | TANESCO |
| Fatuma | Internet | 65,000 | Liquid Telecom |
| Fatuma | Security | 25,000 | Msasani Pearl Mgt |
| Fatuma | Parking | 30,000 | Msasani Pearl Mgt |
| David | Water | 28,000 | DAWASA |
| David | Electricity | 75,000 | TANESCO |
| Zainab | Water | 42,000 | AUWSA |
| Zainab | Electricity | 110,000 | TANESCO |
| Zainab | Gas | 22,000 | Oryx Energy |
| Zainab | Internet | 50,000 | TTCL Fibre |

---

## 8. Rent Bills (3 months: Jan–Mar 2026)

Payment statuses per tenant per month (due 5th of each month):

| Tenant | Jan 2026 | Feb 2026 | Mar 2026 |
|--------|----------|----------|----------|
| Amina (450k) | ✅ paid | ✅ paid | ✅ paid |
| Bernard (600k) | ✅ paid | ✅ paid | ❌ overdue |
| Fatuma (850k) | ✅ paid | 🔶 partial (400k) | ❌ overdue |
| David (550k) | ✅ paid | ✅ paid | ✅ paid |
| Zainab (700k) | ✅ paid | ✅ paid | ⏳ pending |

- Due date: 5th of each month
- `status` ENUM: `pending`, `paid`, `partial`, `overdue`, `waived`

---

## 9. Utility Bills (2 months: Feb–Mar 2026)

Billing pattern per tenant:

| Tenant | Feb 2026 | Mar 2026 |
|--------|----------|----------|
| Amina | ✅ paid | ✅ paid |
| Bernard | ✅ paid | ⏳ pending |
| Fatuma | 🔶 partial (50%) | ❌ overdue |
| David | ✅ paid | ✅ paid |
| Zainab | ✅ paid | ⏳ pending |

- Due date: last day of the month
- Total: **38 utility bill records** (19 utilities × 2 months)

---

## 10. Payments

Total: **42 payment records**, comprising:
- Rent payments linked via `rent_bill_id`
- Utility payments linked via `utility_bill_id`
- Security deposit payments on move-in date

**Key field notes (payments table):**
- `payment_type` — ENUM: `rent`, `utility` (not `deposit`/`penalty` in actual migrations)
- `paid_at` — TIMESTAMP (not `payment_date`)
- `status` — ENUM: `paid`, `partial`, `overdue`, `cancelled`, `pending`
- `rent_bill_id` — nullable FK; links rent payment to a specific rent bill
- `utility_bill_id` — nullable FK; links utility payment to a specific utility bill
- Soft-deletes enabled (`deleted_at`)

---

## 11. Messages (6 records)

| From | To | Content |
|------|----|---------|
| Amina | Wanjiku | Water pressure complaint in MSN-A101 |
| Wanjiku | Amina | DAWASA technician visit arranged |
| Bernard | Wanjiku | Bank transfer delay notice for March rent |
| Wanjiku | Bernard | Late payment warning |
| Fatuma | Wanjiku | Broken window latch in A201 |
| Zainab | Admin | Portal login help request |

**Key field notes (messages table):**
- Columns: `sender_id (FK→users)`, `receiver_id (FK→users)`, `message (text)`
- No `subject`, `body`, or `read_at` in the actual migration

---

## 12. Notifications (5 records)

| For User | Type | Title |
|----------|------|-------|
| Amina | RentDueSoon | Rent Due in 3 Days |
| Bernard | PaymentOverdue | Overdue Rent Notice |
| Fatuma | PaymentOverdue | Overdue Bills Notice |
| Amina | MaintenanceAlert | Scheduled Maintenance |
| Zainab | WelcomeNotification | Welcome to Msasani Pearl! |

**Key field notes (notifications table):**
- `id` — UUID (not auto-increment bigint)
- `notifiable_type` — polymorphic type, e.g. `App\Models\User`
- `notifiable_id` — polymorphic ID
- `data` — JSON payload

---

## Adding New Data

1. **Via Seeder** (recommended for dev resets): Edit `DevelopmentSeeder.php` and re-run `php artisan db:seed`
2. **Via Migration** (for schema changes): Create a new migration in `database/migrations/`
3. **Update this file** whenever `DevelopmentSeeder.php` is modified to keep documentation in sync
