import { describe, it, expect } from 'vitest';
import {
  createQuoteSchema,
  updateQuoteSchema,
  createTemplateSchema,
  registerSchema,
  updatePasswordSchema,
  validateRequest,
} from '@/lib/validations';

const content = (blocks: unknown) => JSON.stringify(blocks);
const ALL = ['HEADER', 'PRICES', 'TEXT', 'TERMS', 'FAQ', 'TABLE', 'TIMELINE', 'CONTACT', 'DISCOUNT', 'PAYMENT', 'SIGNATURE'];

describe('block content validation', () => {
  it.each(ALL)('accepts %s blocks', (type) => {
    expect(createQuoteSchema.safeParse({ title: 'Q', content: content([{ id: 'a', type }]) }).success).toBe(true);
  });

  it.each([
    ['not JSON', '{'],
    ['an object instead of an array', content({ id: 'a', type: 'TEXT' })],
    ['a block without id', content([{ type: 'TEXT' }])],
    ['a block without type', content([{ id: 'a' }])],
    ['an unknown type', content([{ id: 'a', type: 'SCRIPT' }])],
    ['a null block', content([null])],
    ['101 blocks', content(Array.from({ length: 101 }, (_, i) => ({ id: String(i), type: 'TEXT' })))],
  ])('rejects %s', (_label, value) => {
    expect(createQuoteSchema.safeParse({ title: 'Q', content: value }).success).toBe(false);
  });

  it('accepts an empty quote', () => {
    expect(createQuoteSchema.safeParse({ title: 'Q', content: '[]' }).success).toBe(true);
  });

  it('applies the same rules to templates and updates', () => {
    expect(createTemplateSchema.safeParse({ name: 'T', content: content([{ id: 'a', type: 'FAQ' }]) }).success).toBe(true);
    expect(updateQuoteSchema.safeParse({ content: content([{ id: 'a', type: 'TIMELINE' }]) }).success).toBe(true);
  });
});

describe('quote fields', () => {
  it('defaults status to draft', () => {
    const r = createQuoteSchema.parse({ title: 'Q', content: '[]' });
    expect(r.status).toBe('draft');
  });

  it('rejects a title over 500 characters', () => {
    expect(createQuoteSchema.safeParse({ title: 'x'.repeat(501), content: '[]' }).success).toBe(false);
  });

  it('allows a partial update', () => {
    expect(updateQuoteSchema.safeParse({ status: 'sent' }).success).toBe(true);
  });
});

describe('passwords', () => {
  it.each(['Password1', 'Str0ngPass'])('accepts %s', (password) => {
    expect(registerSchema.safeParse({ name: 'A', email: 'a@b.co', password }).success).toBe(true);
  });

  it.each(['short1A', 'alllowercase1', 'ALLUPPER1', 'NoNumbers'])('rejects %s', (password) => {
    expect(registerSchema.safeParse({ name: 'A', email: 'a@b.co', password }).success).toBe(false);
    expect(updatePasswordSchema.safeParse({ currentPassword: 'x', newPassword: password }).success).toBe(false);
  });

  it('normalises email to lowercase and trims it', () => {
    const r = registerSchema.parse({ name: 'A', email: '  Alice@Example.COM ', password: 'Password1' });
    expect(r.email).toBe('alice@example.com');
  });
});

describe('validateRequest', () => {
  it('returns typed data on success', () => {
    const r = validateRequest(updateQuoteSchema, { status: 'sent' });
    expect(r).toEqual({ success: true, data: { status: 'sent' } });
  });

  it('joins field errors into one message', () => {
    const r = validateRequest(registerSchema, { name: '', email: 'x', password: 'y' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error).toMatch(/name/);
      expect(r.error).toMatch(/email/);
      expect(r.error).toMatch(/password/);
    }
  });
});
