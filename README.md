# Estate

> A modern property management platform for landlords and tenants.

[![Tests](https://github.com/luisosena/estate-practice/actions/workflows/tests.yml/badge.svg)](https://github.com/luisosena/estate-practice/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-8.5-blue.svg)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-12-red.svg)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)

## Features

### For Landlords
- 🏠 **Property Management** - Create and manage properties with units
- 👥 **Tenant Management** - Onboard tenants, track lease agreements
- 💰 **Rent Tracking** - Automated rent billing and payment tracking
- 📊 **Dashboard Analytics** - Revenue insights and financial reports
- 📄 **PDF Reports** - Export dashboard data to PDF
- 🔔 **Notifications** - Real-time alerts for payments and due dates

### For Tenants
- 🏠 **Dashboard** - View rent bills, payment history, and utilities
- 💳 **Payments** - Make rent payments securely
- 📄 **Documents** - Access lease agreements and receipts
- 🔔 **Notifications** - Receive alerts for bills and payments
- 📱 **Mobile API** - Full REST API for mobile app integration

### For Admin
- 👤 **User Management** - Manage landlords and tenants
- 🏢 **Property Oversight** - Monitor all properties and units
- 📈 **Audit Reports** - Track system activity and changes

## Screenshots

<!-- TODO: Add screenshots of the application -->
<!-- 
- Landlord Dashboard
- Tenant Dashboard  
- Property Management
- Payment Tracking
-->

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

## Installation

### Prerequisites

- **PHP** 8.5 or higher
- **Composer** 2.x
- **Node.js** 22 or higher
- **npm** or **yarn**
- **Redis** (for production queue/cache)
- **MySQL** or **PostgreSQL** database

### Quick Start

```bash
# Clone the repository
git clone https://github.com/luisosena/estate-practice.git
cd estate-practice

# Install dependencies and setup
composer run setup    # composer install, key:generate, migrate, npm build

# Start development server
composer run dev      # starts server + queue + Vite
```

### Manual Setup

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=estate
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Install Node dependencies
npm install

# Build assets
npm run build

# Start development server
php artisan serve
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

## Development

### Code Style

```bash
# Format PHP code
composer lint

# Format frontend code
npm run format

# Lint frontend code
npm run lint

# Type check TypeScript
npm run types
```

### Database Seeding

```bash
# Run seeders
php artisan db:seed

# Fresh database with seeders
php artisan migrate:fresh --seed
```

### Queue Worker

```bash
# Start queue worker (development)
php artisan queue:listen --tries=1

# Start queue worker (production)
php artisan queue:work --tries=3
```

### Debugging

```bash
# View routes
php artisan route:list

# View configuration
php artisan config:show app.name

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Troubleshooting

### Common Issues

**Vite manifest not found**
```bash
npm run build
# or
npm run dev
```

**Database connection errors**
- Verify `.env` database credentials
- Ensure database server is running
- Run `php artisan migrate:fresh` to reset database

**Queue jobs not processing**
```bash
php artisan queue:work --tries=3
```

**Permission issues (Linux/Mac)**
```bash
chmod -R 775 storage bootstrap/cache
```

**Composer dependency conflicts**
```bash
composer install --no-interaction --prefer-dist --optimize-autoloader
```

## Roadmap

### Current Focus
- ✅ Core property management features
- ✅ Landlord and tenant dashboards
- ✅ Rent billing and payment tracking
- ✅ Mobile API endpoints
- ✅ PDF report generation

### Planned Features
- 🔄 Payment gateway integration (Stripe/PayPal)
- 🔄 SMS notifications via Twilio
- 🔄 Advanced analytics and reporting
- 🔄 Multi-language support
- 🔄 Mobile app (React Native)

### Known Limitations
- Payment gateway contracts exist but are not yet active
- SMS notifications configured but not fully implemented
- Mobile app requires separate development

## Deployment

Deployed on [Render](https://render.com) using Docker. See `Dockerfile`, `render.yaml`, and `start.sh`.

Production env vars to set in Render dashboard:
- `APP_KEY`, `APP_URL`
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_URL`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`
- `SENTRY_LARAVEL_DSN`
- `TWILIO_SID`, `TWILIO_TOKEN`
