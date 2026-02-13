import Tokens from 'csrf';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const tokens = new Tokens();
const CSRF_SECRET_COOKIE = 'csrf-secret';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

/**
 * Generate a CSRF token for the current session
 */
export async function generateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();

  // Check if we already have a secret
  let secret = cookieStore.get(CSRF_SECRET_COOKIE)?.value;

  // Generate new secret if none exists
  if (!secret) {
    secret = tokens.secretSync();
    cookieStore.set(CSRF_SECRET_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  }

  // Generate token from secret
  return tokens.create(secret);
}

/**
 * Verify CSRF token from request
 */
export async function verifyCsrfToken(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const secret = cookieStore.get(CSRF_SECRET_COOKIE)?.value;

  if (!secret) {
    return false;
  }

  // Get token from header
  const token = request.headers.get(CSRF_TOKEN_HEADER);

  if (!token) {
    return false;
  }

  // Verify token
  return tokens.verify(secret, token);
}

/**
 * Middleware helper to check CSRF for state-changing methods
 */
export async function requireCsrfToken(request: NextRequest): Promise<void> {
  const method = request.method;

  // Only check for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return;
  }

  // Skip CSRF check for auth endpoints (NextAuth handles its own CSRF)
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return;
  }

  const isValid = await verifyCsrfToken(request);

  if (!isValid) {
    throw new Error('Invalid CSRF token');
  }
}
