FROM php:8.5-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    ca-certificates

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-scripts --no-interaction

# Expose port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]