#!/bin/bash
# МійАукціон - Server Setup Script
# Run on Ubuntu 22.04+ VPS

echo "🚀 Налаштування сервера МійАукціон..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/auction
sudo chown $USER:$USER /var/www/auction

echo "📦 Копіювання файлів..."
# Copy project files (run from local machine):
# scp -r ./* user@server:/var/www/auction/

# Install dependencies
cd /var/www/auction
npm install --production

# Create uploads directory
mkdir -p uploads

# Setup Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/auction
sudo ln -sf /etc/nginx/sites-available/auction /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "🔒 Отримання SSL сертифіката..."
# Get SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos -m your-email@gmail.com

# Auto-renewal
sudo certbot renew --dry-run

echo "⚙️ Запуск додатку через PM2..."
# Start with PM2
cd /var/www/auction
pm2 start server.js --name "auction" --env production
pm2 save
pm2 startup

# Setup firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo ""
echo "✅ Готово! Сайт доступний на https://your-domain.com"
echo ""
echo "📋 Корисні команди:"
echo "  pm2 status          - статус додатку"
echo "  pm2 logs auction    - логи"
echo "  pm2 restart auction - перезапуск"
echo "  sudo certbot renew  - оновити SSL"
echo ""
