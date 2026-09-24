import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const token = { current: null as null | { id: string } };
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn(async () => token.current) }));

import { middleware } from '../../middleware';

let ipCounter = 0;
function request(
  path: string,
  { method = 'GET', ua = 'Mozilla/5.0', ip, csrf }: { method?: string; ua?: string; ip?: string; csrf?: { cookie?: string; header?: string } } = {}
) {
  const headers: Record<string, string> = {
    'user-agent': ua,
    'x-forwarded-for': ip ?? `10.0.0.${++ipCounter}`,
  };
  if (csrf?.cookie) headers.cookie = `csrf-secret=${csrf.cookie}`;
  if (csrf?.header) headers['x-csrf-token'] = csrf.header;
  return new NextRequest(new URL(path, 'http://localhost:3000'), { method, headers });
}

describe('middleware', () => {
  beforeEach(() => {
    token.current = null;
  });

  describe('route protection', () => {
    it.each(['/quotes', '/builder', '/templates', '/settings', '/dashboard'])(
      'redirects anonymous visitors from %s to /login with a callbackUrl',
      async (path) => {
        const res = await middleware(request(path));
        expect(res.status).toBe(307);
        const location = new URL(res.headers.get('location')!);
        expect(location.pathname).toBe('/login');
        expect(location.searchParams.get('callbackUrl')).toBe(path);
      }
    );

    it('lets signed-in users through to protected pages', async () => {
      token.current = { id: 'u1' };
      const res = await middleware(request('/quotes'));
      expect(res.status).toBe(200);
    });

    it('401s anonymous API reads', async () => {
      const res = await middleware(request('/api/quotes'));
      expect(res.status).toBe(401);
    });

    it.each(['/', '/login', '/register', '/api/health', '/api/csrf', '/api/auth/session'])(
      'leaves public route %s open',
      async (path) => {
        const res = await middleware(request(path));
        expect(res.status).toBe(200);
      }
    );

    it('404s unknown API routes', async () => {
      expect((await middleware(request('/api/secret'))).status).toBe(404);
    });

    it('redirects unknown pages home', async () => {
      const res = await middleware(request('/wp-admin'));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get('location')!).pathname).toBe('/');
    });

    it('does not treat look-alike prefixes as protected API routes', async () => {
      // "/api/quotes-export" is not "/api/quotes"
      token.current = { id: 'u1' };
      expect((await middleware(request('/api/quotesexport'))).status).toBe(404);
    });
  });

  describe('CSRF', () => {
    it('rejects state-changing API calls without a token', async () => {
      token.current = { id: 'u1' };
      const res = await middleware(request('/api/quotes', { method: 'POST' }));
      expect(res.status).toBe(403);
    });

    it('rejects a token that does not match the cookie', async () => {
      token.current = { id: 'u1' };
      const res = await middleware(request('/api/quotes', { method: 'POST', csrf: { cookie: 'a'.repeat(64), header: 'b'.repeat(64) } }));
      expect(res.status).toBe(403);
    });

    it('accepts a matching token', async () => {
      token.current = { id: 'u1' };
      const secret = 'c'.repeat(64);
      const res = await middleware(request('/api/quotes', { method: 'POST', csrf: { cookie: secret, header: secret } }));
      expect(res.status).toBe(200);
    });

    it('does not require CSRF for reads', async () => {
      token.current = { id: 'u1' };
      expect((await middleware(request('/api/quotes'))).status).toBe(200);
    });
  });

  describe('abuse protection', () => {
    it.each(['curl/8.0', 'python-requests/2.31', 'sqlmap/1.7', 'AhrefsBot'])('blocks %s', async (ua) => {
      expect((await middleware(request('/', { ua }))).status).toBe(403);
    });

    it('does not block a normal browser', async () => {
      expect((await middleware(request('/'))).status).toBe(200);
    });

    it('lets a normal browsing session through (a page load plus its API calls)', async () => {
      // One builder visit fires roughly: page, session x3, csrf x2, providers, quote fetch, plus a save.
      // Several of those in a minute is ordinary use and must not hit 429.
      token.current = { id: 'u1' };
      const ip = '192.168.50.1';
      const statuses: number[] = [];
      for (let i = 0; i < 60; i++) {
        statuses.push((await middleware(request(i % 2 ? '/api/auth/session' : '/builder', { ip }))).status);
      }
      expect(statuses).not.toContain(429);
    });

    it('rate-limits a burst of login attempts from one IP', async () => {
      const ip = '192.168.60.1';
      const statuses: number[] = [];
      for (let i = 0; i < 40; i++) {
        statuses.push((await middleware(request('/api/auth/callback/credentials', { method: 'POST', ip }))).status);
      }
      expect(statuses).toContain(429);
    });
  });

  describe('security headers', () => {
    it('sets CSP and framing headers on pages', async () => {
      const res = await middleware(request('/'));
      expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('content-security-policy')).toContain("object-src 'none'");
    });
  });
});
