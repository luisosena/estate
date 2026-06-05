#!/bin/sh
set -e

# Link Render secret file to Laravel's .env FIRST, before anything else
if [ -f /etc/secrets/.env ]; then
    cp /etc/secrets/.env /app/.env
    echo "[start.sh] Loaded .env from Render secret file"
fi

# Generate storage link if not exists
if [ ! -L /app/public/storage ]; then
    php artisan storage:link 2>/dev/null || true
fi

# Run Database Migrations
php artisan migrate --force

# Run database seeders (idempotent — safe on every boot)
php artisan db:seed --force

# Clear and warm caches (must happen AFTER .env is in place)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM in background
php-fpm &

# Wait for PHP-FPM to be ready on port 9000 before starting nginx
echo "[start.sh] Waiting for PHP-FPM on port 9000..."
timeout=30
while ! nc -z 127.0.0.1 9000 2>/dev/null; do
    timeout=$((timeout - 1))
    if [ "$timeout" -le 0 ]; then
        echo "[start.sh] ERROR: PHP-FPM did not start within 30 seconds" >&2
        exit 1
    fi
    sleep 1
done
echo "[start.sh] PHP-FPM is ready"

# Start queue worker in background
# --sleep=3: wait 3s between polls when no jobs
# --tries=3: retry failed jobs up to 3 times
# --max-time=3600: restart worker hourly (prevents memory leaks)
php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &

# Start Reverb WebSocket server in background
# Bind explicitly to loopback so it is never publicly reachable on its own port.
# If Reverb crashes, log it but DO NOT bring down the container — nginx still serves HTTP.
(
    php artisan reverb:start \
        --host="127.0.0.1" \
        --port="${REVERB_SERVER_PORT:-6001}" \
        2>&1 | sed 's/^/[reverb] /' \
    || echo "[start.sh] WARNING: Reverb exited — WebSockets unavailable but HTTP continues"
) &

# Start Nginx in foreground (PID 1 replacement, keeps container alive)
echo "[start.sh] Starting Nginx..."
exec nginx -g 'daemon off;'