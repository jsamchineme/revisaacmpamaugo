#!/bin/bash
# DigitalOcean Droplet Setup Script for Rev. Isaac Mpamaugo Website
# Run this on a fresh Ubuntu 22.04/24.04 Droplet as root
# wget https://raw.githubusercontent.com/yourusername/revisaacmpamaugo/main/deploy/digitalocean-setup.sh && bash digitalocean-setup.sh

set -e

DOMAIN="revisaacmpamaugo.online"
EMAIL="admin@isaacmpamaugo.org"
APP_DIR="/var/www/revisaacmpamaugo"
DEPLOY_USER="deploy"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== DigitalOcean Droplet Setup ===${NC}"

# 1. Update system
echo -e "${BLUE}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y

# 2. Install essential packages
echo -e "${BLUE}[2/10] Installing essential packages...${NC}"
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban

# 3. Install Node.js 20
echo -e "${BLUE}[3/10] Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Install PM2 globally
echo -e "${BLUE}[4/10] Installing PM2...${NC}"
npm install -g pm2
pm2 startup systemd

# 5. Create deployment user
echo -e "${BLUE}[5/10] Creating deploy user...${NC}"
useradd -m -s /bin/bash $DEPLOY_USER || true
usermod -aG sudo $DEPLOY_USER
mkdir -p /home/$DEPLOY_USER/.ssh

# 6. Create app directory
echo -e "${BLUE}[6/10] Setting up application directory...${NC}"
mkdir -p $APP_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR

# 7. Configure UFW firewall
echo -e "${BLUE}[7/10] Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# 8. Configure Nginx
echo -e "${BLUE}[8/10] Configuring Nginx...${NC}"
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create app nginx config
cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name revisaacmpamaugo.online www.revisaacmpamaugo.online;

    location ~ /.well-known/acme-challenge/ {
        root /var/www/revisaacmpamaugo/public;
        allow all;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name revisaacmpamaugo.online www.revisaacmpamaugo.online;

    root /var/www/revisaacmpamaugo/.next/standalone/website/public;

    # SSL certificates (managed by Certbot)
    ssl_certificate     /etc/letsencrypt/live/revisaacmpamaugo.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/revisaacmpamaugo.online/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 256;
    gzip_comp_level 6;
    gzip_vary on;

    # Reverse proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_buffering off;
        proxy_cache off;
    }

    # Static files
    location /_next/static/ {
        alias /var/www/revisaacmpamaugo/.next/standalone/website/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable, max-age=31536000";
        access_log off;
    }

    # User uploads (if using local storage instead of S3)
    location /uploads/ {
        alias /var/www/revisaacmpamaugo/.next/standalone/website/public/uploads/;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
    }

    # Security
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 9. Setup SSL with Certbot
echo -e "${BLUE}[9/10] Setting up SSL with Certbot...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# 10. Setup fail2ban
echo -e "${BLUE}[10/10] Configuring fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
EOF
systemctl restart fail2ban

echo -e "${GREEN}=== Setup Complete ===${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo "1. Add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "2. Clone your repo to $APP_DIR"
echo "3. Create $APP_DIR/.env.production with your secrets"
echo "4. Run: cd $APP_DIR/website && npm ci && npm run build"
echo "5. Start with: pm2 start ecosystem.config.js"
echo ""
echo -e "${GREEN}GitHub Actions secrets needed:${NC}"
echo "- DO_HOST: Your Droplet IP or domain"
echo "- DO_USER: deploy"
echo "- DO_SSH_KEY: Private SSH key for deployment"
echo "- DO_DEPLOY_PATH: $APP_DIR"
echo "- NEXTAUTH_SECRET: Generate with: openssl rand -base64 32"
echo "- NEXTAUTH_URL: https://$DOMAIN"
