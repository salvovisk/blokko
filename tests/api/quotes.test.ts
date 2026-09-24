import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockNextAuth, signInAs, req, params, resetDb, createUser, block, ALL_BLOCK_TYPES } from '../helpers/api';

vi.mock('next-auth', (importOriginal) => mockNextAuth(importOriginal));

import { GET as listQuotes, POST as createQuote } from '@/app/api/quotes/route';
import { GET as getQuote, PUT as updateQuote, DELETE as deleteQuote } from '@/app/api/quotes/[id]/route';
import { prisma } from '@/lib/prisma';

async function seedQuote(userId: string, overrides: Partial<{ title: string; status: string; content: string }> = {}) {
  return prisma.quote.create({
    data: {
      userId,
      title: overrides.title ?? 'Website redesign',
      content: overrides.content ?? JSON.stringify([block('HEADER')]),
      status: overrides.status ?? 'draft',
    },
  });
}

describe('/api/quotes', () => {
  beforeEach(async () => {
    await resetDb();
    signInAs(null);
  });

  describe('auth', () => {
    it('rejects every method without a session', async () => {
      expect((await listQuotes(req('/api/quotes'))).status).toBe(401);
      expect((await createQuote(req('/api/quotes', { method: 'POST', body: { title: 'x' } }))).status).toBe(401);
      expect((await getQuote(req('/api/quotes/abc'), params('abc'))).status).toBe(401);
      expect((await updateQuote(req('/api/quotes/abc', { method: 'PUT', body: {} }), params('abc'))).status).toBe(401);
      expect((await deleteQuote(req('/api/quotes/abc', { method: 'DELETE' }), params('abc'))).status).toBe(401);
    });
  });

  describe('POST', () => {
    it('creates a draft quote with blocks', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createQuote(
        req('/api/quotes', { method: 'POST', body: { title: 'Website redesign', blocks: [block('HEADER'), block('PRICES')] } })
      );
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.title).toBe('Website redesign');
      expect(body.status).toBe('draft');
      expect(body.blocks).toHaveLength(2);
    });

    it.each(ALL_BLOCK_TYPES)('accepts a %s block (every type the builder offers)', async (type) => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createQuote(req('/api/quotes', { method: 'POST', body: { title: 'Q', blocks: [block(type)] } }));
      expect(res.status).toBe(201);
    });

    it('rejects an unknown block type', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createQuote(req('/api/quotes', { method: 'POST', body: { title: 'Q', blocks: [block('EVIL')] } }));
      expect(res.status).toBe(400);
    });

    it('rejects a missing title', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createQuote(req('/api/quotes', { method: 'POST', body: { blocks: [] } }));
      expect(res.status).toBe(400);
    });

    it('rejects more than 100 blocks', async () => {
      await createUser();
      signInAs('alice@example.com');
      const blocks = Array.from({ length: 101 }, () => block('TEXT'));
      const res = await createQuote(req('/api/quotes', { method: 'POST', body: { title: 'Q', blocks } }));
      expect(res.status).toBe(400);
    });

    it('rejects an invalid status', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createQuote(req('/api/quotes', { method: 'POST', body: { title: 'Q', blocks: [], status: 'paid' } }));
      expect(res.status).toBe(400);
    });

    it('answers malformed JSON with 400, not 500', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createQuote(req('/api/quotes', { method: 'POST', rawBody: '{not json' }));
      expect(res.status).toBe(400);
    });
  });

  describe('GET list', () => {
    it('lists only the signed-in user’s quotes, newest first', async () => {
      const alice = await createUser();
      const bob = await createUser('bob@example.com');
      await seedQuote(alice.id, { title: 'Older' });
      await new Promise((r) => setTimeout(r, 5));
      await seedQuote(alice.id, { title: 'Newer' });
      await seedQuote(bob.id, { title: 'Bob’s' });
      signInAs('alice@example.com');

      const body = await (await listQuotes(req('/api/quotes'))).json();
      expect(body.data.map((q: { title: string }) => q.title)).toEqual(['Newer', 'Older']);
      expect(body.pagination.total).toBe(2);
    });

    it('filters by status', async () => {
      const alice = await createUser();
      await seedQuote(alice.id, { status: 'draft' });
      await seedQuote(alice.id, { status: 'sent' });
      signInAs('alice@example.com');
      const body = await (await listQuotes(req('/api/quotes?status=sent'))).json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].status).toBe('sent');
    });

    it('paginates', async () => {
      const alice = await createUser();
      for (let i = 0; i < 5; i++) await seedQuote(alice.id, { title: `Q${i}` });
      signInAs('alice@example.com');
      const body = await (await listQuotes(req('/api/quotes?page=2&limit=2'))).json();
      expect(body.data).toHaveLength(2);
      expect(body.pagination).toMatchObject({ page: 2, limit: 2, total: 5, totalPages: 3 });
    });

    it.each([['page=abc'], ['page=0'], ['page=-1'], ['limit=-5'], ['limit=0'], ['limit=abc']])(
      'survives bad pagination input (%s)',
      async (query) => {
        await createUser();
        signInAs('alice@example.com');
        const res = await listQuotes(req(`/api/quotes?${query}`));
        expect(res.status).toBe(200);
      }
    );

    it('returns blocks: [] for corrupt stored content', async () => {
      const alice = await createUser();
      await seedQuote(alice.id, { content: '{corrupt' });
      signInAs('alice@example.com');
      const body = await (await listQuotes(req('/api/quotes'))).json();
      expect(body.data[0].blocks).toEqual([]);
    });
  });

  describe('GET /:id', () => {
    it('returns the quote with parsed blocks', async () => {
      const alice = await createUser();
      const q = await seedQuote(alice.id);
      signInAs('alice@example.com');
      const res = await getQuote(req(`/api/quotes/${q.id}`), params(q.id));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.blocks[0].type).toBe('HEADER');
    });

    it('does not leak the owner record in the response', async () => {
      const alice = await createUser();
      const q = await seedQuote(alice.id);
      signInAs('alice@example.com');
      const body = await (await getQuote(req(`/api/quotes/${q.id}`), params(q.id))).json();
      expect(body.user).toBeUndefined();
    });

    it('404s for a missing quote', async () => {
      await createUser();
      signInAs('alice@example.com');
      expect((await getQuote(req('/api/quotes/nope'), params('nope'))).status).toBe(404);
    });

    it('403s for someone else’s quote', async () => {
      const alice = await createUser();
      await createUser('bob@example.com');
      const q = await seedQuote(alice.id);
      signInAs('bob@example.com');
      expect((await getQuote(req(`/api/quotes/${q.id}`), params(q.id))).status).toBe(403);
    });
  });

  describe('PUT /:id', () => {
    it('updates title and blocks', async () => {
      const alice = await createUser();
      const q = await seedQuote(alice.id);
      signInAs('alice@example.com');
      const res = await updateQuote(
        req(`/api/quotes/${q.id}`, { method: 'PUT', body: { title: 'Renamed', blocks: [block('TEXT'), block('FAQ')] } }),
        params(q.id)
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.title).toBe('Renamed');
      expect(body.blocks.map((b: { type: string }) => b.type)).toEqual(['TEXT', 'FAQ']);
    });

    it('updates status alone without touching content', async () => {
      const alice = await createUser();
      const q = await seedQuote(alice.id);
      signInAs('alice@example.com');
      const res = await updateQuote(req(`/api/quotes/${q.id}`, { method: 'PUT', body: { status: 'accepted' } }), params(q.id));
      expect(res.status).toBe(200);
      const stored = await prisma.quote.findUniqueOrThrow({ where: { id: q.id } });
      expect(stored.status).toBe('accepted');
      expect(stored.content).toBe(q.content);
    });

    it('rejects an invalid status', async () => {
      const alice = await createUser();
      const q = await seedQuote(alice.id);
      signInAs('alice@example.com');
      const res = await updateQuote(req(`/api/quotes/${q.id}`, { method: 'PUT', body: { status: 'paid' } }), params(q.id));
      expect(res.status).toBe(400);
    });

    it('403s for someone else’s quote and leaves it unchanged', async () => {
      const alice = await createUser();
      await createUser('bob@example.com');
      const q = await seedQuote(alice.id);
      signInAs('bob@example.com');
      const res = await updateQuote(req(`/api/quotes/${q.id}`, { method: 'PUT', body: { title: 'Hacked' } }), params(q.id));
      expect(res.status).toBe(403);
      expect((await prisma.quote.findUniqueOrThrow({ where: { id: q.id } })).title).toBe('Website redesign');
    });

    it('answers malformed JSON with 400, not 500', async () => {
      const alice = await createUser();
      const q = await seedQuote(alice.id);
      signInAs('alice@example.com');
      const res = await updateQuote(req(`/api/quotes/${q.id}`, { method: 'PUT', rawBody: 'nope' }), params(q.id));
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes the quote', async () => {
      const alice = await createUser();
      const q = await seedQuote(alice.id);
      signInAs('alice@example.com');
      expect((await deleteQuote(req(`/api/quotes/${q.id}`, { method: 'DELETE' }), params(q.id))).status).toBe(200);
      expect(await prisma.quote.count()).toBe(0);
    });

    it('403s for someone else’s quote and keeps it', async () => {
      const alice = await createUser();
      await createUser('bob@example.com');
      const q = await seedQuote(alice.id);
      signInAs('bob@example.com');
      expect((await deleteQuote(req(`/api/quotes/${q.id}`, { method: 'DELETE' }), params(q.id))).status).toBe(403);
      expect(await prisma.quote.count()).toBe(1);
    });

    it('404s for a missing quote', async () => {
      await createUser();
      signInAs('alice@example.com');
      expect((await deleteQuote(req('/api/quotes/nope', { method: 'DELETE' }), params('nope'))).status).toBe(404);
    });
  });
});
