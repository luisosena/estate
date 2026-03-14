# Estate Practice Rules for AI Assistants

## Important Context

This project uses the **Estate Practice** property management system - Laravel 12 + React 19 with Inertia.js.

## Required Reading

Before ANY task, read these documentation files in `docs/`:

| Priority | File | Purpose |
|----------|------|---------|
| **CRITICAL** | `docs/BUSINESS_LOGIC.md` | Roles, permissions, CRUD, workflows |
| **CRITICAL** | `docs/DESIGN_PRINCIPLES.md` | shadcn/ui protocol, coding standards |
| HIGH | `docs/PROJECT_ARCHITECTURE.md` | System structure, modules |
| HIGH | `docs/DATABASE_SCHEMA.md` | Tables, relationships |
| MEDIUM | `docs/API_REFERENCE.md` | Endpoints, auth |
| MEDIUM | `docs/DEVELOPMENT_WORKFLOW.md` | Setup, testing, deployment |
| REFERENCE | `docs/CONFIGURATION.md` | Environment variables |
| REFERENCE | `docs/DEPENDENCY_TREE.md` | Dependencies |
| REFERENCE | `docs/KNOWN_ANOMALIES.md` | Issues, workarounds |

## shadcn/ui Rule

**ALWAYS** use CLI to add components:
```bash
npx shadcn@latest add button
```

**NEVER** manually create components or copy from docs.

## Core Architecture

```
Admin > Landlord > Tenant (role hierarchy)
User > Tenant (one-to-one for tenants)
User > Property (one-to-many for landlords)
Property > Unit (one-to-many)
Unit + Tenant > Tenancy (many-to-one)
```

## Key Files

- **Routes**: `routes/web.php`, `routes/api.php`
- **Models**: `app/Models/` (User, Tenant, Property, Unit, Tenancy, Payment, etc.)
- **Controllers**: `app/Http/Controllers/Web/` and `app/Http/Controllers/Api/`
- **Services**: `app/Services/` (PaymentService, TenantService, UtilityService)
- **Config**: `config/` (app, auth, database, fortify, etc.)

## Important Constraints

1. Landlords can ONLY manage their own properties/units
2. Tenants can ONLY see their own data
3. Admin can access everything
4. Always use strict types (PHP `strict_types=1`, TypeScript strict)
5. API tokens for mobile, sessions for web
