#!/bin/sh

# Generate storage link if not exists
if [ ! -L /app/public/storage ]; then
    php artisan storage:link 2>/dev/null || true
fi

# Clear and warm cache
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true

# Start PHP-FPM in background
php-fpm &

# Start Nginx in foreground
nginx -g 'daemon off;'