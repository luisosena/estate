# Development Workflow

## Overview
This document explains the build process, testing approach, deployment procedures, coding standards, code review practices, and contribution guidelines for the Estate Practice application.

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| PHP | 8.2+ | Server-side runtime |
| Composer | 2.x | PHP dependency management |
| Node.js | 20.x+ | Frontend build tools |
| NPM | 10.x+ | Node package management |
| MySQL | 8.0+ | Database |
| Redis | 7.x+ | Cache and sessions (optional for local) |
| Git | 2.x | Version control |

### Optional Tools (Development)

| Tool | Purpose |
|------|---------|
| Laravel Sail | Docker development environment |
| Laravel Herd | Local PHP server |
| TablePlus / DBeaver | Database GUI |
| Postman / Insomnia | API testing |

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url> estate-practice
cd estate-practice
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node Dependencies

```bash
npm install
```

### 4. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Configure Database

Edit `.env` with your database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=estate_practice
DB_USERNAME=root
DB_PASSWORD=
```

### 6. Create Database

```bash
# Create database in MySQL
mysql -u root -p -e "CREATE DATABASE estate_practice;"

# Or use Laravel's database creation command (if configured)
php artisan db:create
```

### 7. Run Migrations

```bash
php artisan migrate
```

### 8. Seed Database (Optional)

```bash
# Run all seeders
php artisan db:seed

# Or run specific seeder
php artisan db:seed --class=DevelopmentSeeder
```

### 9. Build Frontend Assets

```bash
# Development build
npm run dev

# Production build
npm run build
```

### 10. Start Development Server

```bash
# Laravel server
php artisan serve

# With Vite (for hot reload)
npm run dev
```

---

## NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |

---

## Composer Scripts

| Command | Purpose |
|---------|---------|
| `composer test` | Run tests |
| `composer test:coverage` | Run tests with coverage |
| `composer pint` | Format code with Pint |
| `composer pint:check` | Check code formatting |
| `composer analyse` | Run PHPStan analysis |

---

## Coding Standards

### PHP (Laravel) Standards

This project follows:
- PSR-12 coding standards
- Laravel coding standards
- Strict type declarations

#### Code Formatting

Use Laravel Pint for automatic formatting:

```bash
composer pint
```

Check formatting without modifying:

```bash
composer pint:check
```

#### Type Declarations

Always use strict type declarations:

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
```

### TypeScript/JavaScript Standards

This project follows:
- ESLint configuration
- Prettier for code formatting
- Strict TypeScript configuration

#### Code Formatting

```bash
npm run lint:fix
npm run format
```

---

## Code Review Process

### Before Submitting

1. **Run Tests**
   ```bash
   composer test
   npm run lint
   ```

2. **Format Code**
   ```bash
   composer pint
   npm run format
   ```

3. **Verify Build**
   ```bash
   npm run build
   ```

### Pull Request Guidelines

1. Create feature branch from `main`
2. Make changes following coding standards
3. Write tests for new functionality
4. Update documentation if needed
5. Submit pull request
6. Address review feedback

### Branch Naming

| Type | Example | Description |
|------|---------|-------------|
| feature | `feature/add-payment-history` | New feature |
| fix | `fix/tenant-validation-error` | Bug fix |
| docs | `docs/update-api-reference` | Documentation |
| refactor | `refactor/user-authentication` | Code refactoring |
| chore | `chore/update-dependencies` | Maintenance |

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Testing
- `chore`: Maintenance

**Examples**:
```
feat(tenant): add emergency contact field
fix(payment): resolve amount validation error
docs(api): update endpoint documentation
```

---

## Testing

### Running Tests

```bash
# Run all tests
composer test

# Run with coverage
composer test:coverage

# Run specific test file
./vendor/bin/pest tests/Feature/TenantTest.php

# Run tests matching pattern
./vendor/bin/pest --filter="tenant"
```

### Test Structure

```
tests/
├── Feature/          # Feature/integration tests
│   ├── TenantTest.php
│   └── PaymentTest.php
├── Unit/             # Unit tests
│   └── Services/
│       └── TenantServiceTest.php
└── Pest.php         # Test setup and helpers
```

### Writing Tests

Example test with Pest:

```php
<?php

use App\Models\User;
use App\Models\Tenant;

beforeEach(function () {
    $this->landlord = User::factory()->create(['role' => 'landlord']);
});

it('creates a tenant with valid data', function () {
    $response = $this->actingAs($this->landlord)
        ->post('/landlord/tenants', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('tenants', [
        'email' => 'john@example.com',
    ]);
});
```

---

## Build Process

### Development Build

```bash
# Start Vite dev server with hot reload
npm run dev
```

### Production Build

```bash
# Build frontend assets
npm run build

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Asset Compilation

The project uses:
- **Vite** for bundling
- **TailwindCSS** for styling
- **Babel** for transpilation

Configuration: `vite.config.ts`

---

## Deployment

### Production Requirements

1. **Server**: PHP 8.2+, MySQL 8.0+, Redis
2. **Web Server**: Nginx or Apache
3. **Queue Worker**: Supervisor or systemd

### Deployment Steps

#### 1. Prepare Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install --production
npm run build
```

#### 2. Configure Environment

```bash
# Set production environment
APP_ENV=production
APP_DEBUG=false
```

#### 3. Run Migrations

```bash
php artisan migrate --force
```

#### 4. Optimize Application

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

#### 5. Configure Web Server

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name estate-practice.com;
    root /var/www/estate-practice/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt { access_log off; log_not_found off; }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### 6. Queue Worker Setup

Create Supervisor config (`/etc/supervisor/conf.d/estate-worker.conf`):

```ini
[program:estate-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/estate-practice/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/estate-worker.log
stopwaitsecs=3600
```

---

## Scheduled Tasks

### Laravel Scheduler

Add to crontab:

```
* * * * * cd /var/www/estate-practice && php artisan schedule:run >> /dev/null 2>&1
```

### Scheduled Commands

| Command | Schedule | Description |
|---------|----------|-------------|
| `tenancies:end-expired` | Daily at 02:00 | End expired tenancies |
| `tenancies:test-notifications` | On demand | Test notification system |
| `utility-bills:mark-overdue` | Daily (see Kernel.php) | Mark pending/partial bills as overdue |
| `utility-bills:generate-monthly` | 1st of every month at 00:01 | Generate monthly utility bills |

---

## Maintenance

### Cache Clearing

```bash
# Clear all caches
php artisan optimize:clear

# Clear specific caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan clear-compiled
```

### Log Management

```bash
# View logs
tail -f storage/logs/laravel.log

# Clear logs
rm storage/logs/laravel.log
```

### Database Maintenance

```bash
# Backup database
mysqldump -u root -p estate_practice > backup_$(date +%Y%m%d).sql

# Optimize tables
php artisan db:monitor
```

---

## Contribution Guidelines

### Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch

### Development Workflow

1. Keep your fork up to date
2. Write tests first (TDD recommended)
3. Make your changes
4. Run the full test suite
5. Submit a pull request

### Code Quality Requirements

- [ ] All tests pass
- [ ] Code is formatted (Pint, Prettier)
- [ ] No linting errors
- [ ] New features have tests
- [ ] Documentation updated

### Review Criteria

- Code correctness
- Test coverage
- Security considerations
- Performance implications
- Documentation completeness

---

## Summary

This development workflow covers:

1. **Prerequisites**: Required and optional tools
2. **Local Setup**: Step-by-step installation guide
3. **NPM/Composer Scripts**: Available commands
4. **Coding Standards**: PHP and JS/TS standards
5. **Code Review**: PR guidelines and branch naming
6. **Testing**: Running and writing tests
7. **Build Process**: Development and production builds
8. **Deployment**: Production deployment steps
9. **Maintenance**: Cache, logs, and database management
10. **Contribution**: Guidelines for contributors