import { vi } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Session returned by the mocked `getServerSession`. Each API test file must
 * call `vi.mock('next-auth', mockNextAuth)` at the top level.
 */
export const session: { current: { user: { email: string; id?: string } } | null } = { current: null };

export async function mockNextAuth(importOriginal: () => Promise<Record<string, unknown>>) {
  const actual = await importOriginal();
  return {
    ...actual,
    getServerSession: vi.fn(async () => session.current),
  };
}

export function signInAs(email: string | null) {
  session.current = email ? { user: { email } } : null;
}

export function req(
  url: string,
  init: { method?: string; body?: unknown; rawBody?: string; headers?: Record<string, string> } = {}
) {
  const { method = 'GET', body, rawBody, headers = {} } = init;
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
}

export const params = (id: string) => ({ params: Promise.resolve({ id }) });

export async function resetDb() {
  await prisma.template.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.user.deleteMany();
}

export async function createUser(email = 'alice@example.com', password = 'Password1', name = 'Alice') {
  return prisma.user.create({
    data: { email, name, password: await bcrypt.hash(password, 4) },
  });
}

export function block(type: string, data: Record<string, unknown> = {}) {
  return { id: `${type.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`, type, data };
}

export const ALL_BLOCK_TYPES = [
  'HEADER',
  'PRICES',
  'TEXT',
  'TERMS',
  'FAQ',
  'TABLE',
  'TIMELINE',
  'CONTACT',
  'DISCOUNT',
  'PAYMENT',
  'SIGNATURE',
] as const;
