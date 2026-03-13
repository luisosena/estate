# Configuration Documentation

## Overview
This document provides comprehensive documentation of all configuration files, environment variables, feature flags, and their expected values in the Estate Practice application.

---

## Environment Variables

### Creating Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

Then generate application key:
```bash
php artisan key:generate
```

---

### Application Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| APP_NAME | Yes | "Estate Practice" | Application name |
| APP_ENV | Yes | "local" | Application environment (local, production, testing) |
| APP_DEBUG | Yes | true | Enable debug mode (should be false in production) |
| APP_URL | Yes | "http://localhost:8000" | Application URL |
| APP_KEY | Yes | - | Laravel application key (64 chars) |
| APP_LOCALE | Yes | "en" | Default locale |
| APP_FALLBACK_LOCALE | Yes | "en" | Fallback locale |
| APP_FAKER_LOCALE | Yes | "en_US" | Faker locale |

---

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DB_CONNECTION | Yes | "mysql" | Database driver |
| DB_HOST | Yes | "127.0.0.1" | Database host |
| DB_PORT | Yes | "3306" | Database port |
| DB_DATABASE | Yes | - | Database name |
| DB_USERNAME | Yes | - | Database username |
| DB_PASSWORD | Yes | - | Database password |
| DB_PREFIX | No | "" | Table prefix |
| DB_SOCKET | No | - | Database socket path |

**Example**:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=estate_practice
DB_USERNAME=root
DB_PASSWORD=secret
```

---

### Redis Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| REDIS_CLIENT | No | "phpredis" | Redis client (phpredis, predis) |
| REDIS_HOST | No | "127.0.0.1" | Redis host |
| REDIS_PASSWORD | No | null | Redis password |
| REDIS_PORT | No | "6379" | Redis port |

---

### Session Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| SESSION_DRIVER | Yes | "database" | Session driver (file, database, redis, cookie) |
| SESSION_LIFETIME | Yes | "120" | Session lifetime in minutes |
| SESSION_ENCRYPT | Yes | "false" | Encrypt session data |
| SESSION_PATH | Yes | "/" | Session cookie path |
| SESSION_DOMAIN | No | null | Session cookie domain |

---

### Cache Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| CACHE_STORE | Yes | "database" | Cache driver (file, redis, dynamodb, array) |
| CACHE_PREFIX | Yes | "estate_practice_cache" | Cache key prefix |

---

### Queue Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| QUEUE_CONNECTION | Yes | "database" | Queue driver (sync, database, redis, sqs) |
| QUEUE_NAME | Yes | "default" | Default queue name |

---

### Mail Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| MAIL_MAILER | Yes | "smtp" | Mail driver |
| MAIL_HOST | Yes | "mailpit" | SMTP host |
| MAIL_PORT | Yes | "1025" | SMTP port |
| MAIL_USERNAME | No | null | SMTP username |
| MAIL_PASSWORD | No | null | SMTP password |
| MAIL_ENCRYPTION | Yes | null | Encryption type: tls, ssl, or null for no encryption |
| MAIL_FROM_ADDRESS | Yes | "hello@example.com" | From address |
| MAIL_FROM_NAME | Yes | "${APP_NAME}" | From name |

---

### Filesystem Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| FILESYSTEM_DISK | Yes | "local" | Default filesystem disk |
| FILESYSTEM_CLOUD | Yes | "s3" | Cloud filesystem |

---

### Authentication Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| AUTH_GUARD | Yes | "web" | Default authentication guard |
| AUTH_PASSWORD_BROKER | Yes | "users" | Password reset broker |

---

### Fortify Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| FEATURES_PASSWORD_HISTORY | No | false | Prevent password reuse |
| FEATURES_TWO_FACTOR_AUTHENTICATION | No | true | Enable 2FA feature |

---

### API Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| API_PREFIX | Yes | "api" | API route prefix |
| API_VERSION | Yes | "v1" | Default API version |

---

### Mobile App Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| MOBILE_API_URL | No | "http://localhost:8000/api" | Mobile API base URL |

---

## Configuration Files

### config/app.php

Main application configuration:

```php
<?php

return [
    'name' => env('APP_NAME', 'Estate Practice'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'asset_url' => env('ASSET_URL'),
    'timezone' => 'Africa/Dar_es_Salaam',  // Tanzania timezone
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    
    'providers' => [
        // Laravel Framework Service Providers
        // Application Service Providers
    ],
    
    'aliases' => [
        // Class aliases
    ],
];
```

---

### config/auth.php

Authentication configuration:

```php
<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],
    
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver' => 'token',
            'provider' => 'users',
            'hash' => false,
        ],
    ],
    
    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
    ],
    
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],
    
    'password_timeout' => 10800,
];
```

---

### config/fortify.php

Laravel Fortify configuration:

```php
<?php

use App\Providers\FortifyServiceProvider;
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;

return [
    'guard' => 'web',
    
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],
    
    'limiter' => [
        'login' => 'login',
        'two-factor' => 'two-factor',
    ],
    
    'redirects' => [
        'login' => null,
        'logout' => '/login',
        'password-reset' => null,
        'email-verification' => null,
    ],
    
    'providers' => [
        FortifyServiceProvider::class,
    ],
    
    'features' => [
        Features::registration(),
        Features::resetPasswords(),
        Features::emailVerification(),
        Features::updateProfileInformation(),
        Features::updatePasswords(),
        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]),
    ],
];
```

---

### config/database.php

Database configuration:

```php
<?php

return [
    'default' => env('DB_CONNECTION', 'mysql'),
    
    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'estate_practice'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],
        
        'sqlite' => [
            'driver' => 'sqlite',
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ],
    
    'migrations' => 'migrations',
    
    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        
        'default' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
        
        'cache' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],
];
```

---

### config/session.php

Session configuration:

```php
<?php

return [
    'driver' => env('SESSION_DRIVER', 'database'),
    'lifetime' => env('SESSION_LIFETIME', 120),
    'expire_on_close' => false,
    'encrypt' => env('SESSION_ENCRYPT', false),
    'files' => storage_path('framework/sessions'),
    'connection' => env('SESSION_CONNECTION'),
    'table' => 'sessions',
    'store' => env('SESSION_STORE'),
    'lottery' => [2, 100],
    'cookie' => env('SESSION_COOKIE', 'estate_practice_session'),
    'path' => env('SESSION_PATH', '/'),
    'domain' => env('SESSION_DOMAIN'),
    'secure' => env('SESSION_SECURE_COOKIE'),
    'http_only' => true,
    'same_site' => 'lax',
    'partitioned' => false,
];
```

---

### config/logging.php

Logging configuration:

```php
<?php

return [
    'default' => env('LOG_CHANNEL', 'stack'),
    
    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace' => false,
    ],
    
    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['single'],
            'ignore_exceptions' => false,
        ],
        
        'single' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
        ],
        
        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
        ],
        
        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => 'Laravel Log',
            'emoji' => ':boom:',
            'level' => env('LOG_LEVEL', 'critical'),
        ],
        
        'papertrail' => [
            'driver' => 'monolog',
            'level' => env('LOG_LEVEL', 'debug'),
            'handler' => env('LOG_PAPERTRAIL_HANDLER', Monolog\Handler\SyslogUdpHandler::class),
            'handler_with' => [
                'host' => env('PAPERTRAIL_URL'),
                'port' => env('PAPERTRAIL_PORT'),
                'connectionString' => 'tls://'.env('PAPERTRAIL_URL').':'.env('PAPERTRAIL_PORT'),
            ],
        ],
        
        'stderr' => [
            'driver' => 'monolog',
            'level' => env('LOG_LEVEL', 'debug'),
            'handler' => Monolog\Handler\StreamHandler::class,
            'formatter' => env('LOG_STDERR_FORMATTER'),
            'with' => [
                'stream' => 'php://stderr',
            ],
        ],
        
        'syslog' => [
            'driver' => 'syslog',
            'level' => env('LOG_LEVEL', 'debug'),
            'facility' => LOG_USER,
        ],
        
        'errorlog' => [
            'driver' => 'errorlog',
            'level' => env('LOG_LEVEL', 'debug'),
        ],
        
        'null' => [
            'driver' => 'monolog',
            'handler' => Monolog\Handler\NullHandler::class,
        ],
        
        'emergency' => [
            'path' => storage_path('logs/laravel.log'),
        ],
    ],
];
```

---

### config/inertia.php

Inertia.js configuration:

```php
<?php

return [
    'root_view' => 'app',
    
    'page_paths' => [
        resource_path('views'),
    ],
    
    'service' => [
        'manifest' => base_path('../public/build/manifest.json'),
    ],
];
```

---

## Feature Flags

The application uses environment variables to enable/disable features:

| Feature | Variable | Default | Description |
|---------|----------|---------|-------------|
| Registration | FEATURES_REGISTRATION | true | Allow new user registration |
| Password Reset | FEATURES_PASSWORD_RESET | true | Allow password reset |
| Email Verification | FEATURES_EMAIL_VERIFICATION | false | Require email verification |
| Two-Factor Auth | FEATURES_TWO_FACTOR_AUTHENTICATION | true | Enable 2FA |
| Password History | FEATURES_PASSWORD_HISTORY | false | Prevent password reuse |

---

## Environment-Specific Configuration

### Local Development (.env)
```
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=estate_practice
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

### Production (.env)
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://estate-practice.com

DB_CONNECTION=mysql
DB_HOST=production-db-host
DB_PORT=3306
DB_DATABASE=estate_practice
DB_USERNAME=prod_user
DB_PASSWORD=secure_password

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
LOG_CHANNEL=daily

MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_api_key
MAIL_ENCRYPTION=tls
```

---

## Configuration Management

### Artifacts Commands

```bash
# Clear config cache
php artisan config:clear

# Cache config for production
php artisan config:cache

# View config values
php artisan config:show app

# List all configs
php artisan about
```

---

## Third-Party Services

### Mail Services
- **Mailpit**: Local development (included with Laravel Sail)
- **SendGrid**: Production email
- **AWS SES**: Alternative production email

### Cloud Services
- **AWS S3**: File storage
- **DynamoDB**: Cache (optional)

---

## Mobile API Configuration

For the React Native mobile app, configure the API URL:

### Development
```
# In mobile app .env or via code
MOBILE_API_URL=http://10.0.2.2:8000/api  # Android emulator
MOBILE_API_URL=http://localhost:8000/api  # iOS simulator
```

### Production
```
MOBILE_API_URL=https://api.estate-practice.com
```

---

## Summary

This configuration documentation covers:

1. **Environment Variables**: All required and optional env variables
2. **Configuration Files**: Complete config for app, auth, database, session, logging, and Inertia
3. **Feature Flags**: Feature toggles via environment
4. **Environment-Specific**: Local vs production configurations
5. **Management Commands**: Artisan commands for config management
6. **Third-Party Services**: Mail and cloud service integration
7. **Mobile Configuration**: API URL setup for mobile app