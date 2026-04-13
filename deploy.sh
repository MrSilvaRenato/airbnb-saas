#!/usr/bin/env bash
set -e
cd /var/www/airbnb-saas

echo "Pulling latest code..."
git reset --hard HEAD
git clean -fd
git pull origin main

composer install --no-dev --optimize-autoloader --no-interaction || true

php artisan migrate --force || true

rm -rf public/build
sudo -u deploy bash -lc "cd /var/www/airbnb-saas && npm ci && npm run build" || true

php artisan view:clear || true
php artisan config:cache || true
php artisan route:cache || true

php artisan cache:clear

sudo /bin/systemctl restart php8.2-fpm || true
sudo /bin/systemctl reload nginx || true

echo "Deployed at $(date)"
