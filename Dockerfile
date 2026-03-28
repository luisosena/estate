FROM php:8.5-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
  curl \
  git \
  zip \
  unzip \
  ca-certificates \
  nginx

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-scripts --no-interaction

# Fix permissions for Laravel
RUN chmod -R 777 /app/storage /app/bootstrap/cache

COPY start.sh /start.sh
RUN chmod +x /start.sh

# Configure Nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Expose port
EXPOSE 8000

# Start Nginx + PHP-FPM
CMD ["/start.sh"]
