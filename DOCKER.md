# BLOKKO - Docker Deployment Guide

This guide covers deploying the BLOKKO landing page using Docker on your own server.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f blokko

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`

### Using Docker CLI

```bash
# Build the image
docker build -t blokko-landing .

# Run the container
docker run -d \
  --name blokko \
  -p 3000:3000 \
  --restart unless-stopped \
  blokko-landing

# View logs
docker logs -f blokko

# Stop the container
docker stop blokko
docker rm blokko
```

## Production Deployment

### 1. Build on Your Server

```bash
# Clone the repository
git clone https://github.com/salvovisk/blokko.git
cd blokko

# Build and start
docker-compose up -d
```

### 2. Behind Nginx Reverse Proxy

Create `/etc/nginx/sites-available/blokko`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/blokko /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL with Certbot

```bash
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

For production, you can set environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  # Add any other env vars here
```

## Resource Configuration

Default resource limits (configurable in docker-compose.yml):
- **CPU**: 1 core limit, 0.5 core reservation
- **Memory**: 512MB limit, 256MB reservation

Adjust based on your traffic:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
```

## Health Checks

The container includes a health check that pings `/api/health` every 30 seconds.

Check health status:
```bash
docker inspect blokko-landing | grep -A 10 Health
```

## Monitoring

### View Logs
```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f blokko
```

### Container Stats
```bash
docker stats blokko-landing
```

## Updates & Maintenance

### Update the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Or without downtime
docker-compose up -d --build --no-deps blokko
```

### Clean Up Old Images

```bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a
```

## Backup & Restore

### Backup Container
```bash
# Export image
docker save blokko-landing > blokko-backup.tar

# Backup config
cp docker-compose.yml docker-compose.yml.backup
```

### Restore
```bash
# Import image
docker load < blokko-backup.tar

# Restore and start
docker-compose up -d
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs blokko

# Check build output
docker-compose build --no-cache
```

### Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use 8080 externally instead
```

### High Memory Usage
```bash
# Check memory
docker stats blokko-landing

# Reduce in docker-compose.yml
memory: 256M
```

### Can't Access from External IP
```bash
# Make sure port is open in firewall
sudo ufw allow 3000

# Or if behind Nginx
sudo ufw allow 80
sudo ufw allow 443
```

## Security Recommendations

1. **Always use HTTPS** - Set up SSL with Let's Encrypt
2. **Use reverse proxy** - Don't expose Node.js directly
3. **Keep updated** - Regularly pull and rebuild
4. **Monitor logs** - Watch for suspicious activity
5. **Resource limits** - Prevent container from consuming all resources
6. **Non-root user** - Container runs as `nextjs` user (already configured)

## Performance Optimization

### Enable Nginx Caching

Add to Nginx config:
```nginx
# Cache static files
location /_next/static {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 365d;
    add_header Cache-Control "public, immutable";
}
```

### Enable Gzip
Next.js compression is already enabled, but you can also enable in Nginx:
```nginx
gzip on;
gzip_types text/css application/javascript application/json;
```

## System Requirements

- **Docker**: 20.10+
- **Docker Compose**: 2.0+ (optional but recommended)
- **RAM**: Minimum 512MB, recommended 1GB
- **CPU**: 1 core minimum
- **Disk**: ~500MB for image + build cache

## Multi-Server Deployment

For multiple servers, use the same image:

```bash
# On build server
docker build -t blokko-landing .
docker save blokko-landing | gzip > blokko.tar.gz

# Transfer to other servers
scp blokko.tar.gz user@server:/tmp/

# On target server
gunzip -c /tmp/blokko.tar.gz | docker load
docker run -d -p 3000:3000 blokko-landing
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/blokko
            git pull
            docker-compose up -d --build
```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Verify health: `curl http://localhost:3000/api/health`
- Rebuild: `docker-compose up -d --build --force-recreate`

---

**Ready to deploy!** Start with `docker-compose up -d` and your BLOKKO landing page will be live.
