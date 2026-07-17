# Deploy to DigitalOcean

This guide covers deploying the Rev. Isaac Mpamaugo website to a DigitalOcean Droplet.

## Architecture

- **Droplet**: Ubuntu 22.04/24.04 with Node.js, PM2, Nginx
- **Database**: SQLite (file-based, included in deployment)
- **File Storage**: Cloudinary
- **SSL**: Let's Encrypt via Certbot
- **CI/CD**: GitHub Actions → rsync → PM2 restart

## Prerequisites

1. **DigitalOcean account** with:
   - A Droplet (Ubuntu 22.04+, 2GB RAM minimum)
   - A Cloudinary account (free tier available)
   - A domain pointing to your Droplet IP

2. **GitHub repository secrets**:
   - `DO_HOST`: Your Droplet IP or domain
   - `DO_USER`: deploy (or your SSH user)
   - `DO_SSH_KEY`: Private SSH key for deployment
   - `DO_DEPLOY_PATH`: `/var/www/revisaacmpamaugo`
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: `https://revisaacmpamaugo.online`

## Option 1: Automated Setup (Recommended)

SSH into your fresh Ubuntu Droplet and run:

```bash
# As root on the Droplet
wget https://raw.githubusercontent.com/yourusername/revisaacmpamaugo/main/website/deploy/digitalocean-setup.sh
bash digitalocean-setup.sh
```

This script will:
- Update system packages
- Install Node.js 20, PM2, Nginx, Certbot
- Create a `deploy` user
- Configure UFW firewall
- Setup Nginx with SSL
- Configure fail2ban

## Option 2: Manual Setup

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
sudo pm2 startup systemd

# Create deploy user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
```

### 2. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable
```

### 3. App Directory

```bash
sudo mkdir -p /var/www/revisaacmpamaugo
sudo chown -R deploy:deploy /var/www/revisaacmpamaugo
```

### 4. Nginx

```bash
# Copy config
sudo cp website/nginx/revisaacmpamaugo.online.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/revisaacmpamaugo.online /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 5. SSL Certificate

```bash
sudo certbot --nginx -d revisaacmpamaugo.online -d www.revisaacmpamaugo.online
```

## Application Deployment

### First Deploy

```bash
# On the Droplet, as deploy user
ssh deploy@YOUR_DROPLET_IP
cd /var/www/revisaacmpamaugo

# Clone repo
git clone https://github.com/yourusername/revisaacmpamaugo.git .

# Create production env
cp website/.env.example website/.env.production
nano website/.env.production
# Fill in: NEXTAUTH_SECRET, DATABASE_URL, Cloudinary credentials

# Build
cd website
npm ci
npm run build

# Setup PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

### Subsequent Deploys (GitHub Actions)

Push to `main` branch — GitHub Actions will:
1. Build the app
2. rsync to `/var/www/revisaacmpamaugo`
3. Restart via PM2
4. Reload Nginx

## Cloudinary Configuration

### 1. Create a Cloudinary Account

- Sign up at https://cloudinary.com/users/register/free
- Get your **Cloud Name**, **API Key**, and **API Secret** from the dashboard

### 2. Environment Variables

Add to `website/.env.production`:

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Images are automatically optimized and delivered via Cloudinary's CDN.

## Database

The app uses SQLite. The database file lives in the deployment directory.

### Initial Setup

```bash
cd /var/www/revisaacmpamaugo/website
npx prisma migrate deploy
npm run seed
```

### Backups

Add to crontab for daily backups:

```bash
# Backup database daily at 2 AM
0 2 * * * cp /var/www/revisaacmpamaugo/website/prisma/dev.db /var/backups/revisaacmpamaugo-$(date +\%Y\%m\%d).db
```

## Monitoring

### PM2

```bash
# View logs
pm2 logs revisaacmpamaugo

# Monitor resources
pm2 monit

# Restart
pm2 restart revisaacmpamaugo
```

### Nginx

```bash
# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Renewal

Certbot auto-renews. Verify:

```bash
sudo certbot renew --dry-run
```

## Troubleshooting

### Permission Denied on Deploy

Ensure the `deploy` user owns the app directory:
```bash
sudo chown -R deploy:deploy /var/www/revisaacmpamaugo
```

### Cloudinary Upload Fails

1. Verify credentials: `echo $CLOUDINARY_CLOUD_NAME`
2. Check your Cloudinary dashboard for upload permissions
3. Verify your account hasn't exceeded the free tier limits

### Database Locked

SQLite doesn't support concurrent writes well. If you see "database is locked":
- Reduce PM2 instances to 1 (already configured)
- Consider migrating to PostgreSQL if traffic grows

## Migration to PostgreSQL (Optional)

If you outgrow SQLite:

1. Create a DigitalOcean Managed Database (PostgreSQL)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Update `lib/db.ts` to remove the `PrismaBetterSqlite3` adapter
4. Update `.env.production`:
   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   ```
5. Run `npx prisma migrate deploy`

## Support

- **DigitalOcean Docs**: https://docs.digitalocean.com/
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/quick-start/
