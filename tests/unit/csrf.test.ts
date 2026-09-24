import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyCsrfToken, requireCsrfToken } from '@/lib/csrf';
import { withCsrf } from '@/hooks/useCsrf';

function request(method: string, path = '/api/quotes', cookie?: string, header?: string) {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = `csrf-secret=${cookie}`;
  if (header) headers['x-csrf-token'] = header;
  return new NextRequest(new URL(path, 'http://localhost'), { method, headers });
}

describe('csrf', () => {
  const secret = 'f'.repeat(64);

  it('verifies a matching cookie and header', () => {
    expect(verifyCsrfToken(request('POST', '/api/quotes', secret, secret))).toBe(true);
  });

  it.each([
    ['no cookie', undefined, secret],
    ['no header', secret, undefined],
    ['different token', secret, 'e'.repeat(64)],
    ['different length', secret, 'f'.repeat(10)],
  ])('fails with %s', (_l, cookie, header) => {
    expect(verifyCsrfToken(request('POST', '/api/quotes', cookie, header))).toBe(false);
  });

  it('only guards state-changing methods', () => {
    expect(() => requireCsrfToken(request('GET'))).not.toThrow();
    expect(() => requireCsrfToken(request('POST'))).toThrow();
    expect(() => requireCsrfToken(request('DELETE'))).toThrow();
  });

  it('skips NextAuth’s own endpoints', () => {
    expect(() => requireCsrfToken(request('POST', '/api/auth/callback/credentials'))).not.toThrow();
  });

  it('withCsrf adds the header and keeps existing ones', () => {
    const init = withCsrf('tok', { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', 'x-csrf-token': 'tok' });
    expect(init.method).toBe('PUT');
  });

  it('withCsrf leaves the request alone without a token', () => {
    const init = { method: 'PUT' };
    expect(withCsrf(null, init)).toBe(init);
  });
});
