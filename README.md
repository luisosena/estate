# Estate

> Property management platform for landlords and tenants.

[![Tests](https://github.com/luisosena/estate-practice/actions/workflows/tests.yml/badge.svg)](https://github.com/luisosena/estate-practice/actions/workflows/tests.yml)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12 (PHP 8.5) |
| Frontend | React 19 + Inertia.js v2 |
| Styling | Tailwind CSS v4 |
| Auth | Laravel Fortify + Sanctum |
| Mobile API | REST (Laravel Sanctum) |
| Queue | Redis (production) / Database (local) |
| PDF | barryvdh/laravel-dompdf |
| Deploy | Render (Docker) |

## Quick Start

```bash
git clone https://github.com/luisosena/estate-practice.git
cd estate-practice
composer run setup    # install, key:generate, migrate, npm build
composer run dev      # start server + queue + Vite
```

## Architecture Overview

- **API**: `/api/v1/` — Sanctum-authenticated, versioned REST endpoints for the mobile app
- **Web**: Inertia.js SPA — server-side routing with React components
- **Authorization**: Laravel Policies — enforced at both Web and API layers
- **Payment scaffold**: Phase 3 gateway contracts in `app/Contracts/` — not yet active

## Key Directories

| Path | Purpose |
|------|---------|
| `app/Http/Controllers/Api/` | API controllers (Landlord + Tenant) |
| `app/Http/Controllers/Web/` | Web controllers (Inertia) |
| `app/Services/` | Business logic layer |
| `app/Policies/` | Authorization policies |
| `resources/js/pages/` | React page components |
| `docs/plans/` | Architecture & refactoring plans |

## Running Tests

```bash
php artisan test --compact
```

## Deployment

Deployed on [Render](https://render.com) using Docker. See `Dockerfile`, `render.yaml`, and `start.sh`.

Production env vars to set in Render dashboard:
- `APP_KEY`, `APP_URL`
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_URL`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`
- `SENTRY_LARAVEL_DSN`
- `TWILIO_SID`, `TWILIO_TOKEN`
