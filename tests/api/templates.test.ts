import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockNextAuth, signInAs, req, params, resetDb, createUser, block } from '../helpers/api';

vi.mock('next-auth', (importOriginal) => mockNextAuth(importOriginal));

import { GET as listTemplates, POST as createTemplate } from '@/app/api/templates/route';
import {
  GET as getTemplate,
  PUT as updateTemplate,
  DELETE as deleteTemplate,
} from '@/app/api/templates/[id]/route';
import { prisma } from '@/lib/prisma';

async function seedTemplate(userId: string | null, name = 'Web package', isSystem = false) {
  return prisma.template.create({
    data: { userId, name, isSystem, content: JSON.stringify([block('HEADER'), block('PRICES')]) },
  });
}

describe('/api/templates', () => {
  beforeEach(async () => {
    await resetDb();
    signInAs(null);
  });

  it('rejects every method without a session', async () => {
    expect((await listTemplates(req('/api/templates'))).status).toBe(401);
    expect((await createTemplate(req('/api/templates', { method: 'POST', body: {} }))).status).toBe(401);
    expect((await getTemplate(req('/api/templates/x'), params('x'))).status).toBe(401);
    expect((await updateTemplate(req('/api/templates/x', { method: 'PUT', body: {} }), params('x'))).status).toBe(401);
    expect((await deleteTemplate(req('/api/templates/x', { method: 'DELETE' }), params('x'))).status).toBe(401);
  });

  describe('GET list', () => {
    it('returns system templates first, then the user’s own, never other users’', async () => {
      const alice = await createUser();
      const bob = await createUser('bob@example.com');
      await seedTemplate(alice.id, 'Alice’s');
      await seedTemplate(null, 'System', true);
      await seedTemplate(bob.id, 'Bob’s');
      signInAs('alice@example.com');

      const body = await (await listTemplates(req('/api/templates'))).json();
      expect(body.data.map((t: { name: string }) => t.name)).toEqual(['System', 'Alice’s']);
      expect(body.data.find((t: { name: string }) => t.name === 'Alice’s').isOwner).toBe(true);
      expect(body.data.find((t: { name: string }) => t.name === 'System').isOwner).toBe(false);
      expect(body.data[0].blocks).toHaveLength(2);
    });

    it('survives bad pagination input', async () => {
      await createUser();
      signInAs('alice@example.com');
      expect((await listTemplates(req('/api/templates?page=abc&limit=-1'))).status).toBe(200);
    });
  });

  describe('POST', () => {
    it('creates a template owned by the user', async () => {
      const alice = await createUser();
      signInAs('alice@example.com');
      const res = await createTemplate(
        req('/api/templates', { method: 'POST', body: { name: 'Retainer', blocks: [block('HEADER'), block('FAQ')] } })
      );
      expect(res.status).toBe(201);
      const stored = await prisma.template.findFirstOrThrow();
      expect(stored.userId).toBe(alice.id);
      expect(stored.isSystem).toBe(false);
    });

    it('cannot be used to create a system template', async () => {
      await createUser();
      signInAs('alice@example.com');
      await createTemplate(
        req('/api/templates', { method: 'POST', body: { name: 'Sneaky', isSystem: true, blocks: [block('TEXT')] } })
      );
      expect((await prisma.template.findFirstOrThrow()).isSystem).toBe(false);
    });

    it('accepts a missing or null description (what the builder sends)', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createTemplate(
        req('/api/templates', { method: 'POST', body: { name: 'No desc', description: null, blocks: [block('TEXT')] } })
      );
      expect(res.status).toBe(201);
    });

    it('requires at least one block', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createTemplate(req('/api/templates', { method: 'POST', body: { name: 'Empty', blocks: [] } }));
      expect(res.status).toBe(400);
    });

    it('requires a name', async () => {
      await createUser();
      signInAs('alice@example.com');
      const res = await createTemplate(req('/api/templates', { method: 'POST', body: { blocks: [block('TEXT')] } }));
      expect(res.status).toBe(400);
    });

    it('answers malformed JSON with 400', async () => {
      await createUser();
      signInAs('alice@example.com');
      expect((await createTemplate(req('/api/templates', { method: 'POST', rawBody: '{' }))).status).toBe(400);
    });
  });

  describe('GET /:id', () => {
    it('lets anyone read a system template', async () => {
      await createUser();
      const t = await seedTemplate(null, 'System', true);
      signInAs('alice@example.com');
      expect((await getTemplate(req(`/api/templates/${t.id}`), params(t.id))).status).toBe(200);
    });

    it('403s on another user’s template', async () => {
      await createUser();
      const bob = await createUser('bob@example.com');
      const t = await seedTemplate(bob.id);
      signInAs('alice@example.com');
      expect((await getTemplate(req(`/api/templates/${t.id}`), params(t.id))).status).toBe(403);
    });

    it('404s on a missing template', async () => {
      await createUser();
      signInAs('alice@example.com');
      expect((await getTemplate(req('/api/templates/nope'), params('nope'))).status).toBe(404);
    });
  });

  describe('PUT /:id', () => {
    it('renames the user’s own template', async () => {
      const alice = await createUser();
      const t = await seedTemplate(alice.id);
      signInAs('alice@example.com');
      const res = await updateTemplate(req(`/api/templates/${t.id}`, { method: 'PUT', body: { name: 'Renamed' } }), params(t.id));
      expect(res.status).toBe(200);
      expect((await prisma.template.findUniqueOrThrow({ where: { id: t.id } })).name).toBe('Renamed');
    });

    it('refuses to edit system templates', async () => {
      await createUser();
      const t = await seedTemplate(null, 'System', true);
      signInAs('alice@example.com');
      const res = await updateTemplate(req(`/api/templates/${t.id}`, { method: 'PUT', body: { name: 'X' } }), params(t.id));
      expect(res.status).toBe(403);
    });

    it('refuses to edit another user’s template', async () => {
      await createUser();
      const bob = await createUser('bob@example.com');
      const t = await seedTemplate(bob.id);
      signInAs('alice@example.com');
      const res = await updateTemplate(req(`/api/templates/${t.id}`, { method: 'PUT', body: { name: 'X' } }), params(t.id));
      expect(res.status).toBe(403);
    });

    it('rejects an empty name', async () => {
      const alice = await createUser();
      const t = await seedTemplate(alice.id);
      signInAs('alice@example.com');
      const res = await updateTemplate(req(`/api/templates/${t.id}`, { method: 'PUT', body: { name: '' } }), params(t.id));
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes the user’s own template', async () => {
      const alice = await createUser();
      const t = await seedTemplate(alice.id);
      signInAs('alice@example.com');
      expect((await deleteTemplate(req(`/api/templates/${t.id}`, { method: 'DELETE' }), params(t.id))).status).toBe(200);
      expect(await prisma.template.count()).toBe(0);
    });

    it('refuses to delete system templates', async () => {
      await createUser();
      const t = await seedTemplate(null, 'System', true);
      signInAs('alice@example.com');
      expect((await deleteTemplate(req(`/api/templates/${t.id}`, { method: 'DELETE' }), params(t.id))).status).toBe(403);
      expect(await prisma.template.count()).toBe(1);
    });

    it('refuses to delete another user’s template', async () => {
      await createUser();
      const bob = await createUser('bob@example.com');
      const t = await seedTemplate(bob.id);
      signInAs('alice@example.com');
      expect((await deleteTemplate(req(`/api/templates/${t.id}`, { method: 'DELETE' }), params(t.id))).status).toBe(403);
    });
  });
});
