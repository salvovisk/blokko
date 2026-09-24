import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET_COOKIE = 'csrf-secret';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

/**
 * Generate a random token (Edge-compatible)
 */
function generateRandomToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple timing-safe comparison (Edge-compatible)
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a CSRF token for the current session
 */
export async function generateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();

  // Check if we already have a secret
  let secret = cookieStore.get(CSRF_SECRET_COOKIE)?.value;

  // Generate new secret if none exists
  if (!secret) {
    secret = generateRandomToken();
    cookieStore.set(CSRF_SECRET_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  }

  // For simplicity, use the secret as the token
  // In production, you might want to hash this
  return secret;
}

/**
 * Verify CSRF token from request (Edge-compatible)
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  const secret = request.cookies.get(CSRF_SECRET_COOKIE)?.value;

  if (!secret) {
    return false;
  }

  // Get token from header
  const token = request.headers.get(CSRF_TOKEN_HEADER);

  if (!token) {
    return false;
  }

  // Verify token matches secret (timing-safe)
  return timingSafeEqual(secret, token);
}

/**
 * Middleware helper to check CSRF for state-changing methods
 */
export function requireCsrfToken(request: NextRequest): void {
  const method = request.method;

  // Only check for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return;
  }

  // Skip CSRF check for auth endpoints (NextAuth handles its own CSRF)
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return;
  }

  const isValid = verifyCsrfToken(request);

  if (!isValid) {
    throw new Error('Invalid CSRF token');
  }
}
