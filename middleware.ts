import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Bot user agents to block (common scrapers and malicious bots)
const BLOCKED_USER_AGENTS = [
  'semrush',
  'ahrefs',
  'dotbot',
  'mj12bot',
  'majestic',
  'ahrefsbot',
  'serpstat',
  'linkdex',
  'spam',
  'bot.htm',
  'python-requests',
  'curl',
  'wget',
  'scanner',
  'sqlmap',
  'nikto',
  'masscan',
];

// Allowed routes (home page, auth pages, dashboard, and static assets)
const ALLOWED_ROUTES = ['/', '/_next', '/favicon.svg', '/api/health', '/api/auth', '/login', '/register', '/dashboard'];

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired record
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  // Increment count
  record.count++;

  // Check if over limit
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

function isBlockedUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;

  const ua = userAgent.toLowerCase();
  return BLOCKED_USER_AGENTS.some(blocked => ua.includes(blocked));
}

function shouldAllowRoute(pathname: string): boolean {
  // Allow exact matches and prefixes
  return ALLOWED_ROUTES.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get client IP (handles various proxy headers)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Block malicious user agents
  if (isBlockedUserAgent(userAgent)) {
    console.warn(`[SECURITY] Blocked bot: ${userAgent.substring(0, 100)} from ${ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Rate limiting (only for non-static assets)
  if (!pathname.startsWith('/_next') && !pathname.includes('.')) {
    if (isRateLimited(ip)) {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}`);
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
        }
      });
    }
  }

  // 3. Redirect all non-allowed routes to home (except API routes which return 404)
  if (!shouldAllowRoute(pathname)) {
    // Block API routes completely
    if (pathname.startsWith('/api/')) {
      console.warn(`[SECURITY] Blocked API access: ${pathname} from ${ip}`);
      return new NextResponse('Not Found', { status: 404 });
    }

    // Redirect other routes to home
    console.log(`[REDIRECT] ${pathname} -> / (IP: ${ip})`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Add security headers
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Prevent clickjacking
  response.headers.set('Content-Security-Policy',
    "frame-ancestors 'self'"
  );

  // HTTPS enforcement (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc)
     */
    '/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
