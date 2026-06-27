FROM php:8.5-fpm-alpine

# Install dependencies (NodeJS/NPM/gcompat are required for Vite)
RUN apk add --no-cache \
  curl \
  git \
  zip \
  unzip \
  ca-certificates \
  libzip-dev \
  libpng-dev \
  nodejs \
  npm \
  nginx \
  gcompat \
  netcat-openbsd

# Install PHP extensions
RUN apk add --no-cache $PHPIZE_DEPS \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && apk del $PHPIZE_DEPS
RUN docker-php-ext-install pdo pdo_mysql zip gd pcntl bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-scripts --no-interaction

# CREATE DUMMY .env FOR VITE BUILD
# Laravel Vite plugins (Wayfinder/Ziggy) boot the Laravel framework during `npm run build` to generate TypeScript types.
# Without a .env file, the framework crashes instantly. We provide a throwaway .env just for the build phase.
RUN cp .env.example .env \
  && php artisan key:generate \
  && touch database/database.sqlite \
  && sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env \
  && sed -i 's|APP_URL=http://localhost|APP_URL=https://estate-6icx.onrender.com|' .env \
  && sed -i 's|APP_URL=http://localhost|APP_URL=https://estate-6icx.onrender.com|' .env.example \
  && sed -i 's|REVERB_HOST=localhost|REVERB_HOST=estate-6icx.onrender.com|' .env \
  && sed -i 's|REVERB_PORT=6001|REVERB_PORT=443|' .env \
  && sed -i 's|REVERB_SCHEME=http|REVERB_SCHEME=https|' .env \
  && sed -i 's|REVERB_APP_KEY=|REVERB_APP_KEY=nbsfpldxcdbwksgienip|' .env \
  && sed -i 's|VITE_POSTHOG_KEY=|VITE_POSTHOG_KEY=phc_n7TkKrshWwFakTtuvJkmkQTNFdEPci52N6DzUNHZzmQh|' .env \
  && echo "ASSET_URL=https://estate-6icx.onrender.com" >> .env

# Build the Vite frontend assets
RUN rm -f package-lock.json && npm install
RUN npm run build

# Remove dummy .env so the real Render Secret File is used at runtime
RUN rm .env

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
