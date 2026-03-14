# Estate Practice

A Laravel 12 + React 19 property management system with multi-tenant support.

## Tech Stack

- **Backend**: Laravel 12.x, PHP 8.2+
- **Frontend**: React 19, TypeScript, Inertia.js
- **UI**: TailwindCSS 4.0, shadcn/ui
- **Mobile**: React Native/Expo
- **Database**: MySQL 8.0+

## Quick Start

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
php artisan serve
npm run dev
```

## Documentation

**⚠️ IMPORTANT: Before any task, read the documentation files in `docs/`:**

| Priority | File | Description |
|----------|------|-------------|
| **CRITICAL** | [`docs/BUSINESS_LOGIC.md`](docs/BUSINESS_LOGIC.md) | Roles, permissions, CRUD, workflows |
| **CRITICAL** | [`docs/DESIGN_PRINCIPLES.md`](docs/DESIGN_PRINCIPLES.md) | shadcn/ui protocol, coding standards |
| HIGH | [`docs/PROJECT_ARCHITECTURE.md`](docs/PROJECT_ARCHITECTURE.md) | System architecture |
| HIGH | [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Database tables |
| MEDIUM | [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) | API endpoints |
| MEDIUM | [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) | Setup & deployment |
| REFERENCE | [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) | Environment variables |
| REFERENCE | [`docs/DEPENDENCY_TREE.md`](docs/DEPENDENCY_TREE.md) | Dependencies |
| REFERENCE | [`docs/KNOWN_ANOMALIES.md`](docs/KNOWN_ANOMALIES.md) | Known issues |

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `landlord` | Property & tenant management |
| `tenant` | Personal data & payments |

## shadcn/ui Rule

**When adding UI components, ALWAYS use:**

```bash
npx shadcn@latest add button
```

**NEVER manually create component variations.**

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/Http/Controllers/` | Controllers (Web + API) |
| `app/Models/` | Eloquent models |
| `app/Services/` | Business logic |
| `database/migrations/` | Database schema |
| `routes/` | API & web routes |
| `config/` | Configuration |
| `docs/` | Documentation |
| `mobile/` | React Native app |

## API Endpoints

- **Auth**: `/api/auth/*`
- **Landlord**: `/api/landlord/*`
- **Tenant**: `/api/tenant/*`

## Available Scripts

```bash
# PHP
php artisan serve
php artisan migrate
composer test

# Node
npm run dev
npm run build
npm run lint
```

## License

MIT
