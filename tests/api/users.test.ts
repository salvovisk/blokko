import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { mockNextAuth, signInAs, req, resetDb, createUser } from '../helpers/api';

vi.mock('next-auth', (importOriginal) => mockNextAuth(importOriginal));

import { POST as register } from '@/app/api/auth/register/route';
import { PUT as updateProfile } from '@/app/api/user/profile/route';
import { PUT as updatePassword } from '@/app/api/user/password/route';
import { GET as health } from '@/app/api/health/route';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Authorize = (credentials: Record<string, string> | undefined) => Promise<{ id: string; email: string } | null>;
const authorize = (authOptions.providers[0] as unknown as { options: { authorize: Authorize } }).options.authorize;

describe('POST /api/auth/register', () => {
  beforeEach(resetDb);

  const valid = { name: 'Alice', email: 'Alice@Example.com', password: 'Password1' };

  it('creates a user with a hashed password and lowercased email', async () => {
    const res = await register(req('/api/auth/register', { method: 'POST', body: valid }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe('alice@example.com');
    expect(body.user.password).toBeUndefined();

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: 'alice@example.com' } });
    expect(stored.password).not.toBe('Password1');
    expect(await bcrypt.compare('Password1', stored.password)).toBe(true);
  });

  it('rejects a duplicate email regardless of case', async () => {
    await register(req('/api/auth/register', { method: 'POST', body: valid }));
    const res = await register(req('/api/auth/register', { method: 'POST', body: { ...valid, email: 'ALICE@example.com' } }));
    expect(res.status).toBe(400);
    expect(await prisma.user.count()).toBe(1);
  });

  it.each([
    ['short password', { password: 'Pass1' }],
    ['no uppercase', { password: 'password1' }],
    ['no number', { password: 'Password' }],
    ['bad email', { email: 'not-an-email' }],
    ['empty name', { name: '' }],
  ])('rejects %s', async (_label, patch) => {
    const res = await register(req('/api/auth/register', { method: 'POST', body: { ...valid, ...patch } }));
    expect(res.status).toBe(400);
  });

  it('answers malformed JSON with 400', async () => {
    expect((await register(req('/api/auth/register', { method: 'POST', rawBody: 'x' }))).status).toBe(400);
  });
});

describe('credentials login (authorize)', () => {
  beforeEach(resetDb);

  it('returns the user for correct credentials, case-insensitive email', async () => {
    const u = await createUser('alice@example.com', 'Password1');
    const user = await authorize({ email: 'ALICE@example.com', password: 'Password1' });
    expect(user?.id).toBe(u.id);
  });

  it('rejects a wrong password', async () => {
    await createUser('alice@example.com', 'Password1');
    await expect(authorize({ email: 'alice@example.com', password: 'nope' })).rejects.toThrow();
  });

  it('rejects an unknown email', async () => {
    await expect(authorize({ email: 'ghost@example.com', password: 'Password1' })).rejects.toThrow();
  });

  it('rejects missing credentials', async () => {
    await expect(authorize(undefined)).rejects.toThrow();
  });
});

describe('PUT /api/user/profile', () => {
  beforeEach(async () => {
    await resetDb();
    signInAs(null);
  });

  it('401s without a session', async () => {
    expect((await updateProfile(req('/api/user/profile', { method: 'PUT', body: { name: 'X' } }))).status).toBe(401);
  });

  it('updates the name', async () => {
    await createUser();
    signInAs('alice@example.com');
    const res = await updateProfile(req('/api/user/profile', { method: 'PUT', body: { name: 'Alice B.' } }));
    expect(res.status).toBe(200);
    expect((await prisma.user.findFirstOrThrow()).name).toBe('Alice B.');
  });

  it('ignores attempts to change email', async () => {
    await createUser();
    signInAs('alice@example.com');
    await updateProfile(req('/api/user/profile', { method: 'PUT', body: { name: 'A', email: 'evil@example.com' } }));
    expect((await prisma.user.findFirstOrThrow()).email).toBe('alice@example.com');
  });

  it('rejects an empty name', async () => {
    await createUser();
    signInAs('alice@example.com');
    expect((await updateProfile(req('/api/user/profile', { method: 'PUT', body: { name: '' } }))).status).toBe(400);
  });
});

describe('PUT /api/user/password', () => {
  beforeEach(async () => {
    await resetDb();
    signInAs(null);
  });

  it('changes the password when the current one is right', async () => {
    await createUser('alice@example.com', 'Password1');
    signInAs('alice@example.com');
    const res = await updatePassword(
      req('/api/user/password', { method: 'PUT', body: { currentPassword: 'Password1', newPassword: 'NewPassword2' } })
    );
    expect(res.status).toBe(200);
    const stored = await prisma.user.findFirstOrThrow();
    expect(await bcrypt.compare('NewPassword2', stored.password)).toBe(true);
  });

  it('refuses when the current password is wrong', async () => {
    await createUser('alice@example.com', 'Password1');
    signInAs('alice@example.com');
    const res = await updatePassword(
      req('/api/user/password', { method: 'PUT', body: { currentPassword: 'Wrong1', newPassword: 'NewPassword2' } })
    );
    expect(res.status).toBe(400);
    expect(await bcrypt.compare('Password1', (await prisma.user.findFirstOrThrow()).password)).toBe(true);
  });

  it('enforces the password policy on the new password', async () => {
    await createUser('alice@example.com', 'Password1');
    signInAs('alice@example.com');
    const res = await updatePassword(
      req('/api/user/password', { method: 'PUT', body: { currentPassword: 'Password1', newPassword: 'weak' } })
    );
    expect(res.status).toBe(400);
  });

  it('401s without a session', async () => {
    const res = await updatePassword(req('/api/user/password', { method: 'PUT', body: {} }));
    expect(res.status).toBe(401);
  });
});

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const body = await (await health()).json();
    expect(body.status).toBe('ok');
  });
});
