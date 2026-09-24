# BLOKKO Production Deployment Guide

## Overview

This guide covers deploying the complete BLOKKO application (authentication, quote builder, templates, and API) to production using Docker with SQLite database persistence.

**Deployment architecture:**
- Self-hosted Docker deployment
- SQLite database (persisted via Docker volume)
- Single-instance deployment
- Nginx reverse proxy for SSL/HTTPS
- Manual deployment process

**Current state:**
- Landing page deployed on `main` branch
- Full application on `auth-enabled` branch (ready to deploy)
- SQLite for single-instance (suitable for thousands of requests/day)
- Security hardening completed (CSRF, validation, rate limiting)

---

## Phase 1: Pre-Deployment Preparation

### 1.1 Generate Production Secrets

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Copy this value - you'll need it for your `.env.production` file.

### 1.2 Prepare Environment Configuration

Create your production environment file:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your production values:

```env
NODE_ENV=production
DATABASE_URL=file:/app/data/production.db
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<paste-generated-secret-here>
```

**Important security notes:**
- Never commit `.env.production` to version control
- Use strong, unique secrets (never reuse from development)
- Set proper file permissions: `chmod 600 .env.production`

### 1.3 Review Configuration Files

Verify these files are correctly configured:

- `docker-compose.yml` - Docker services and volumes
- `Dockerfile` - Container build configuration
- `.env.production.example` - Production environment template
- `prisma/schema.prisma` - Database schema (SQLite provider)

---

## Phase 2: Local Testing

Before deploying to production, test the full production setup locally.

### 2.1 Build and Start Services

```bash
# Build Docker image
docker-compose --env-file .env.production build

# Start services
docker-compose --env-file .env.production up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f blokko
```

Wait for: `Ready on http://0.0.0.0:3000`

### 2.2 Verify Database Setup

```bash
# Check database file exists
docker-compose exec blokko ls -lh /app/data/

# View schema
docker-compose exec blokko npx prisma db execute --stdin <<< ".tables"

# Expected output: users, quotes, templates
```

### 2.3 Run Smoke Tests

Test all critical functionality:

```bash
# Health check
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}

# Landing page
curl -I http://localhost:3000
# Expected: 200 OK

# CSRF endpoint
curl http://localhost:3000/api/csrf
# Expected: {"token":"..."}
```

**Browser tests:**
1. Open `http://localhost:3000` - should load landing page
2. Navigate to `/register` - create a test account
3. Login at `/login`
4. Verify dashboard loads at `/dashboard`
5. Test quote builder at `/builder`
6. Check templates at `/templates`
7. Update profile at `/settings`

### 2.4 Test Database Persistence

Verify data survives container restarts:

```bash
# Create a quote in the builder, then restart
docker-compose restart blokko

# Wait for startup, then verify quote still exists
# Login and check /quotes page
```

### 2.5 Seed Demo Data (Optional)

Add system templates:

```bash
docker-compose exec blokko npm run db:seed
```

### 2.6 Cleanup Local Test

Once testing is complete:

```bash
docker-compose down
```

---

## Phase 3: Production Server Setup

### 3.1 Server Requirements

**Minimum specifications:**
- 1 CPU core
- 512 MB RAM
- 10 GB storage
- Ubuntu 20.04+ or Debian 11+

**Software requirements:**
- Docker and Docker Compose
- Nginx (for reverse proxy)
- Certbot (for SSL certificates)

### 3.2 Install Docker

If not already installed:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

Verify installation:

```bash
docker --version
docker-compose --version
```

### 3.3 Configure Firewall

Allow only necessary ports:

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (for SSL verification)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 3.4 Create Application Directory

```bash
sudo mkdir -p /opt/blokko
sudo chown $USER:$USER /opt/blokko
cd /opt/blokko
```

---

## Phase 4: Deploy Application

### 4.1 Deploy Code

```bash
# Clone repository
git clone <your-repo-url> /opt/blokko
cd /opt/blokko

# Checkout full application branch
git checkout auth-enabled
```

### 4.2 Configure Production Environment

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

Set the following variables:
- `NEXTAUTH_URL=https://yourdomain.com`
- `NEXTAUTH_SECRET=<your-generated-secret>`
- `DATABASE_URL=file:/app/data/production.db` (already set)

```bash
# Secure the environment file
chmod 600 .env.production
```

### 4.3 Build and Start Application

```bash
# Build Docker image
docker-compose --env-file .env.production up -d --build

# Monitor startup
docker-compose logs -f blokko
```

Wait for: `Ready on http://0.0.0.0:3000`

### 4.4 Initialize Database

The database schema is automatically created on container start via `prisma db push` in the Dockerfile CMD.

Optionally seed system templates:

```bash
docker-compose exec blokko npm run db:seed
```

### 4.5 Verify Deployment

```bash
# Check container is running
docker-compose ps

# Test health endpoint
curl http://localhost:3000/api/health

# Check logs for errors
docker-compose logs --tail=50 blokko
```

---

## Phase 5: SSL and Nginx Configuration

### 5.1 Install Nginx and Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL Certificate

```bash
# Get certificate (interactive)
sudo certbot certonly --nginx -d yourdomain.com

# Certificate will be saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

Auto-renewal is configured automatically. Test with:

```bash
sudo certbot renew --dry-run
```

### 5.3 Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/blokko
```

Paste the following configuration:

```nginx
upstream blokko_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://blokko_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location /_next/static {
        proxy_pass http://blokko_app;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # API endpoints - no cache
    location /api {
        proxy_pass http://blokko_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Important:** Replace `yourdomain.com` with your actual domain in multiple places.

### 5.4 Enable Configuration and Restart Nginx

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/blokko /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

### 5.5 Verify HTTPS Access

Open `https://yourdomain.com` in your browser. You should see the BLOKKO landing page with a valid SSL certificate.

---

## Phase 6: Post-Deployment Verification

### 6.1 Run Production Smoke Tests

Test all critical endpoints:

```bash
# Health check
curl https://yourdomain.com/api/health

# CSRF token
curl https://yourdomain.com/api/csrf

# Landing page
curl -I https://yourdomain.com
```

**Browser verification:**
1. Navigate to `https://yourdomain.com`
2. Register a new account at `/register`
3. Login at `/login`
4. Create a quote in `/builder`
5. Save and verify in `/quotes`
6. Test templates at `/templates`
7. Update profile at `/settings`
8. Test PDF generation from quote

### 6.2 Configure Database Backups

Create backup script:

```bash
sudo nano /opt/blokko/backup.sh
```

Paste the following:

```bash
#!/bin/bash
BACKUP_DIR="/opt/blokko/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup SQLite database from Docker volume
docker run --rm \
  -v blokko_blokko_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/blokko_$DATE.tar.gz -C /data .

# Keep only last 14 days
find $BACKUP_DIR -name "blokko_*.tar.gz" -mtime +14 -delete

echo "Backup completed: $BACKUP_DIR/blokko_$DATE.tar.gz"
```

Make executable:

```bash
chmod +x /opt/blokko/backup.sh
```

Add to crontab (daily at 2 AM):

```bash
crontab -e
```

Add line:

```
0 2 * * * /opt/blokko/backup.sh >> /var/log/blokko-backup.log 2>&1
```

Test backup:

```bash
/opt/blokko/backup.sh
ls -lh /opt/blokko/backups/
```

### 6.3 Configure Log Rotation

Create log rotation config:

```bash
sudo nano /etc/logrotate.d/blokko
```

Paste:

```
/opt/blokko/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $USER $USER
}
```

---

## Phase 7: Monitoring and Maintenance

### 7.1 Monitor Application Logs

```bash
# View live logs
docker-compose logs -f blokko

# View last 100 lines
docker-compose logs --tail=100 blokko

# Search logs
docker-compose logs blokko | grep ERROR
```

### 7.2 Monitor Container Health

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# System resources
df -h
free -m
top
```

### 7.3 Monitor Database Size

```bash
# Check database size
docker-compose exec blokko ls -lh /app/data/production.db

# Or from host (volume inspection)
docker run --rm -v blokko_blokko_data:/data alpine du -h /data
```

### 7.4 Database Maintenance

**Optimize database (periodically):**

```bash
docker-compose exec blokko npx prisma db execute --stdin <<< "VACUUM;"
```

**View database stats:**

```bash
docker-compose exec blokko npx prisma studio
# Access at http://localhost:5555 (SSH tunnel recommended)
```

---

## Phase 8: Updates and Rollbacks

### 8.1 Deploy Updates

When deploying updates from the `auth-enabled` branch:

```bash
cd /opt/blokko

# 1. Backup database first
/opt/blokko/backup.sh

# 2. Pull latest changes
git pull origin auth-enabled

# 3. Rebuild and restart (database persists in volume)
docker-compose down
docker-compose --env-file .env.production up -d --build

# 4. Schema changes are applied automatically on startup
# Monitor logs to ensure successful startup
docker-compose logs -f blokko

# 5. Verify deployment
curl https://yourdomain.com/api/health
```

### 8.2 Rollback to Previous Version

If an update causes issues:

```bash
cd /opt/blokko

# 1. Stop application
docker-compose down

# 2. Revert to previous commit
git log --oneline -5  # Find previous commit hash
git checkout <previous-commit-hash>

# 3. Rebuild and restart
docker-compose --env-file .env.production up -d --build

# 4. If needed, restore database backup
docker run --rm \
  -v blokko_blokko_data:/data \
  -v /opt/blokko/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/blokko_YYYYMMDD_HHMMSS.tar.gz"

# 5. Restart application
docker-compose restart blokko
```

### 8.3 Zero-Downtime Updates

For minimal downtime during updates:

```bash
# 1. Pull changes
git pull origin auth-enabled

# 2. Build new image (doesn't affect running container)
docker-compose --env-file .env.production build

# 3. Quick restart (typically 10-20 seconds downtime)
docker-compose --env-file .env.production up -d
```

---

## Phase 9: Troubleshooting

### 9.1 Container Won't Start

**Check logs:**
```bash
docker-compose logs blokko
```

**Common issues:**

1. **Missing environment variables:**
   - Verify `.env.production` exists and has all required variables
   - Check: `docker-compose config` to see resolved configuration

2. **Port already in use:**
   - Check: `sudo lsof -i :3000`
   - Stop conflicting service or change port in `docker-compose.yml`

3. **Database connection errors:**
   - Verify DATABASE_URL format: `file:/app/data/production.db`
   - Check volume permissions: `docker run --rm -v blokko_blokko_data:/data alpine ls -la /data`

### 9.2 Database Issues

**Schema sync errors:**
```bash
# Check schema status
docker-compose exec blokko npx prisma validate

# Force schema push (safe for SQLite)
docker-compose exec blokko npx prisma db push --accept-data-loss --skip-generate
```

**Corrupted database:**
```bash
# Restore from backup (see Phase 8.2)
# Or reset database (WARNING: deletes all data)
docker-compose down
docker volume rm blokko_blokko_data
docker-compose --env-file .env.production up -d
```

### 9.3 Nginx Issues

**Configuration errors:**
```bash
# Test configuration
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**502 Bad Gateway:**
- Application not running: `docker-compose ps`
- Wrong port in Nginx config (should be 3000)
- Application crashed: `docker-compose logs blokko`

### 9.4 SSL Certificate Issues

**Certificate expired:**
```bash
# Check expiration
sudo certbot certificates

# Renew manually
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

### 9.5 Out of Disk Space

**Clean Docker resources:**
```bash
# Remove unused images
docker system prune -a

# Remove old backups
find /opt/blokko/backups -mtime +30 -delete

# Check disk usage
df -h
du -sh /opt/blokko/*
```

---

## Phase 10: Security Checklist

Before going live, verify all security measures are in place:

- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] SSH key-based authentication enabled
- [ ] SSH password authentication disabled
- [ ] Strong `NEXTAUTH_SECRET` generated and set
- [ ] `.env.production` has proper permissions (600)
- [ ] SSL certificate valid and auto-renewing
- [ ] Database backups scheduled (daily cron job)
- [ ] Rate limiting active (middleware)
- [ ] CSRF protection enabled (all POST/PUT/DELETE/PATCH)
- [ ] Input validation active (Zod schemas)
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Bot blocking active (middleware)
- [ ] Non-root user in Docker container (nextjs:nodejs)
- [ ] Nginx security headers configured
- [ ] Regular updates scheduled (system, Docker, application)

---

## Phase 11: Migration to PostgreSQL (Future)

If you need to scale to multiple instances, migrate from SQLite to PostgreSQL:

### 11.1 Export SQLite Data

```bash
# Dump current data
docker-compose exec blokko npx prisma db execute \
  --stdin <<< ".dump" > /tmp/sqlite_dump.sql
```

### 11.2 Update Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}

// Remove @default(autoincrement()) from id fields
// Change to @default(auto())
```

### 11.3 Add PostgreSQL to Docker Compose

Update `docker-compose.yml` to add PostgreSQL service (see DOCKER.md for example).

### 11.4 Import Data

```bash
# Create migration
npx prisma migrate dev --name init-postgres

# Import data (manual - SQL conversion needed)
# SQLite and PostgreSQL have different SQL dialects
```

**Note:** This migration is non-urgent. SQLite handles thousands of requests/day easily for single-instance deployments.

---

## Quick Reference

### Essential Commands

```bash
# View logs
docker-compose logs -f blokko

# Restart application
docker-compose restart blokko

# Check status
docker-compose ps

# Run backup
/opt/blokko/backup.sh

# Update application
cd /opt/blokko && git pull && docker-compose up -d --build

# Check health
curl https://yourdomain.com/api/health

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Important File Locations

- Application: `/opt/blokko/`
- Environment: `/opt/blokko/.env.production`
- Backups: `/opt/blokko/backups/`
- Nginx config: `/etc/nginx/sites-available/blokko`
- SSL certs: `/etc/letsencrypt/live/yourdomain.com/`
- Docker volume: `blokko_blokko_data` (use `docker volume inspect` to find mount point)

---

## Success Criteria

Your deployment is successful when:

- [ ] Application accessible via HTTPS
- [ ] Can register new user account
- [ ] Can login and access dashboard
- [ ] Can create and save quotes
- [ ] Can generate PDFs from quotes
- [ ] Can use templates
- [ ] Database persists across container restarts
- [ ] Backups running automatically
- [ ] Health check returns 200 OK
- [ ] No errors in application logs
- [ ] SSL certificate valid (A+ rating on ssllabs.com)

---

## Support and Resources

- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment practices
- [DOCKER.md](./DOCKER.md) - Docker specifics
- [SECURITY-IMPROVEMENTS.md](./SECURITY-IMPROVEMENTS.md) - Security features

For issues or questions:
- Check logs: `docker-compose logs blokko`
- Review this guide's Troubleshooting section (Phase 9)
- Verify environment configuration
- Check Docker and system resources

---

**Last Updated:** 2026-02-13
**Application Version:** auth-enabled branch
**Database:** SQLite (single-instance)
