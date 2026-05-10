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
# Seeds are not run on boot — run targeted seeders manually if needed.
php artisan migrate --force

# Clear and warm cache
php artisan config:cache 
php artisan route:cache 
php artisan view:cache 

# Start PHP-FPM in background
php-fpm &

# Start Nginx in foreground
nginx -g 'daemon off;'