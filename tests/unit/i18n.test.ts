import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import en from '@/i18n/en.json';
import it_ from '@/i18n/it.json';

type Tree = { [k: string]: string | Tree };

function leaves(obj: Tree, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') acc[key] = v;
    else Object.assign(acc, leaves(v, key));
    return acc;
  }, {});
}

const enLeaves = leaves(en as Tree);
const itLeaves = leaves(it_ as Tree);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : /\.tsx?$/.test(d.name) ? [path.join(dir, d.name)] : []
  );
}

describe('translations', () => {
  it('Italian has every English key', () => {
    const missing = Object.keys(enLeaves).filter((k) => !(k in itLeaves));
    expect(missing).toEqual([]);
  });

  it('English has every Italian key', () => {
    const extra = Object.keys(itLeaves).filter((k) => !(k in enLeaves));
    expect(extra).toEqual([]);
  });

  it('no string is empty', () => {
    const empty = [...Object.entries(enLeaves), ...Object.entries(itLeaves)].filter(([, v]) => v.trim() === '');
    expect(empty).toEqual([]);
  });

  it('placeholders match between languages', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    const mismatched = Object.keys(enLeaves).filter((k) => k in itLeaves && vars(enLeaves[k]) !== vars(itLeaves[k]));
    expect(mismatched).toEqual([]);
  });

  it('every t.* key referenced in the source exists', () => {
    const src = path.resolve(__dirname, '../../src');
    const used = new Set<string>();
    for (const file of walk(src)) {
      const code = readFileSync(file, 'utf8');
      for (const m of code.matchAll(/\bt\.((?:[a-zA-Z_]\w*\.)*[a-zA-Z_]\w*)/g)) {
        // Drop trailing string methods: t.foo.bar.replace(...) -> foo.bar
        used.add(m[1].replace(/\.(replace|toUpperCase|toLowerCase|split|trim)$/, ''));
      }
    }
    // A reference may point at a leaf or at a subtree (e.g. t.builder.sidebar.blocks)
    const known = new Set<string>();
    for (const key of Object.keys(enLeaves)) {
      const parts = key.split('.');
      for (let i = 1; i <= parts.length; i++) known.add(parts.slice(0, i).join('.'));
    }
    // Ignore obvious non-translation uses like t.id / t.name on template objects
    const missing = [...used].filter(
      (k) => !known.has(k) && /^(common|landing|auth|dashboard|builder|confirmDialog|messages)\./.test(k)
    );
    expect(missing).toEqual([]);
  });
});
