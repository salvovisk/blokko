# BLOKKO - Deployment Security Guide

## 🛡️ Security Features Implemented

Your landing page now has comprehensive protection:

### ✅ Middleware Protection (`middleware.ts`)

1. **Rate Limiting**
   - 30 requests per minute per IP
   - Automatic cleanup of old records
   - Returns 429 (Too Many Requests) when exceeded

2. **Bot Protection**
   - Blocks common malicious bots (scrapers, scanners, attackers)
   - Blocks: SEMrush, Ahrefs, sqlmap, nikto, masscan, curl, wget, etc.
   - Returns 403 (Forbidden) for blocked user agents

3. **Route Protection**
   - Only allows: `/`, `/_next/*`, `/favicon.svg`, `/api/health`
   - Redirects all other routes to home
   - Blocks all API routes except health check

4. **Security Headers**
   - X-Frame-Options: Prevents clickjacking
   - X-Content-Type-Options: Prevents MIME sniffing
   - X-XSS-Protection: XSS filter
   - Content-Security-Policy: Frame ancestors control
   - Strict-Transport-Security: HTTPS enforcement (production only)
   - Permissions-Policy: Disables camera, mic, geolocation

5. **IP Tracking**
   - Supports multiple proxy headers (Cloudflare, Vercel, etc.)
   - Logs suspicious activity

### ✅ Health Check Endpoint

- `/api/health` - Returns service status for monitoring
- Can be used with uptime monitors (UptimeRobot, Better Uptime, etc.)

## 🚀 Recommended Deployment Platforms

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel includes:**
- DDoS protection
- Edge caching
- Automatic HTTPS
- Global CDN
- Web Application Firewall (WAF) on Pro plan

**Additional Vercel Security:**
1. Enable "DDoS Mitigation" in project settings
2. Add custom domain: blokkobld.com
3. Consider Pro plan for enhanced WAF

### Option 2: Cloudflare Pages
```bash
# Connect GitHub repo or deploy directly
npx wrangler pages deploy .next
```

**Cloudflare includes:**
- DDoS protection (unlimited on all plans)
- Bot protection
- Rate limiting (on Workers plan)
- WAF rules
- Excellent for high traffic

### Option 3: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## 🔒 Additional Security Recommendations

### 1. Environment Variables
Never commit secrets. For production, set:
```bash
NODE_ENV=production
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=your-production-db
```

### 2. Cloudflare (Recommended Layer)
Even with Vercel/Netlify, add Cloudflare in front:
- Free tier includes excellent DDoS protection
- Set security level to "High"
- Enable "Bot Fight Mode"
- Enable "Browser Integrity Check"
- Configure rate limiting rules

### 3. Custom WAF Rules (Cloudflare)
```
# Block common attack patterns
(http.request.uri.path contains "wp-admin") or
(http.request.uri.path contains "phpMyAdmin") or
(http.request.uri.path contains ".env") or
(http.request.uri.path contains "sql")
```

### 4. Monitoring
Set up uptime monitoring:
- **UptimeRobot** (free): Monitor `/api/health`
- **Better Uptime**: Professional monitoring
- **Sentry**: Error tracking (if you add later)

### 5. Database Security (for future)
When you enable auth later:
- Use connection pooling
- Enable SSL/TLS connections
- Whitelist deployment platform IPs only
- Regular backups

## 📊 Rate Limit Tuning

Current: 30 requests/minute per IP

Adjust in `middleware.ts` if needed:
```typescript
const RATE_LIMIT_MAX_REQUESTS = 30; // Increase for high traffic
const RATE_LIMIT_WINDOW = 60 * 1000; // Time window in ms
```

For production with high traffic, consider:
- Using Redis for distributed rate limiting
- Using Vercel Edge Config
- Using Cloudflare Rate Limiting

## 🧪 Testing Your Security

### Test Rate Limiting
```bash
# Send 35 requests quickly
for i in {1..35}; do curl https://blokkobld.com; done
# Should get 429 after 30 requests
```

### Test Bot Blocking
```bash
# Should return 403
curl -A "python-requests/2.0" https://blokkobld.com
curl -A "curl/7.0" https://blokkobld.com
```

### Test Route Protection
```bash
# Should redirect to /
curl -L https://blokkobld.com/login
curl -L https://blokkobld.com/register
curl -L https://blokkobld.com/quotes

# Should return 404
curl https://blokkobld.com/api/auth/signin
```

### Test Health Check
```bash
# Should return 200 with JSON
curl https://blokkobld.com/api/health
```

## 🎯 Pre-Deployment Checklist

- [ ] Environment variables set
- [ ] Custom domain configured (blokkobld.com)
- [ ] HTTPS enforced
- [ ] Rate limiting tested
- [ ] Bot blocking tested
- [ ] Health check accessible
- [ ] Uptime monitoring configured
- [ ] Error tracking setup (optional)
- [ ] Cloudflare WAF configured (recommended)
- [ ] Security headers verified

## 🚨 Incident Response

If you notice suspicious activity:

1. **Check logs** for patterns
2. **Adjust rate limits** if needed
3. **Add IPs to Cloudflare blocklist**
4. **Enable "I'm Under Attack" mode** in Cloudflare (last resort)

## 📈 Scaling for Launch Day

When you're ready to launch:

1. **Increase rate limits** (50-100/min)
2. **Enable Cloudflare caching** for static assets
3. **Set up Redis** for distributed rate limiting
4. **Monitor with Sentry** for errors
5. **Use Vercel Pro** or **Cloudflare Pro** for enhanced protection

---

Your landing page is now production-ready with enterprise-grade security! 🎉
