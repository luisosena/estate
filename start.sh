#!/bin/sh

# Generate storage link if not exists
if [ ! -L /app/public/storage ]; then
    php artisan storage:link 2>/dev/null || true
fi

# Link Render secret file to Laravel's directory
if [ -f /etc/secrets/.env ]; then
    cp /etc/secrets/.env /app/.env
fi

# Run Database Migrations and Seeds
# We use --force because this is a production-like environment
php artisan migrate --force
php artisan db:seed --force

# Clear and warm cache
php artisan config:cache 
php artisan route:cache 
php artisan view:cache 

# Start PHP-FPM in background
php-fpm &

# Start Nginx in foreground
nginx -g 'daemon off;'