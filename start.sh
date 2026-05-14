#!/bin/sh

# Generate storage link if not exists
if [ ! -L /app/public/storage ]; then
    php artisan storage:link 2>/dev/null || true
fi

# Link Render secret file to Laravel's directory
if [ -f /etc/secrets/.env ]; then
    cp /etc/secrets/.env /app/.env
fi

# Run Database Migrations
php artisan migrate --force

# Seed required lookup data (idempotent — uses insertOrIgnore, safe on every boot)
php artisan db:seed --class=UtilityTypeSeeder --force

# Clear and warm cache
php artisan config:cache 
php artisan route:cache 
php artisan view:cache 

# Start PHP-FPM in background
php-fpm &

# Start queue worker in background
# --sleep=3: wait 3s between polls when no jobs
# --tries=3: retry failed jobs up to 3 times
# --max-time=3600: restart worker hourly (prevents memory leaks)
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &

# Start Nginx in foreground
nginx -g 'daemon off;'