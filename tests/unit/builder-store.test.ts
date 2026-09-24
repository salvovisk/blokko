import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useBuilderStore, serializeBlocks } from '@/stores/builder-store';
import type { Block, BlockType } from '@/types/blocks';

const store = () => useBuilderStore.getState();
const types = () => store().blocks.map((b) => b.type);

const initial = useBuilderStore.getState();

beforeEach(() => {
  useBuilderStore.setState(initial, true);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('blocks', () => {
  it.each<BlockType>(['HEADER', 'PRICES', 'TEXT', 'TERMS', 'FAQ', 'TABLE', 'TIMELINE', 'CONTACT', 'DISCOUNT', 'PAYMENT', 'SIGNATURE'])(
    'adds a %s block with default data and makes it active',
    (type) => {
      store().addBlock(type);
      const [b] = store().blocks;
      expect(b.type).toBe(type);
      expect(b.data).toBeTruthy();
      expect(Object.keys(b.data).length).toBeGreaterThan(0);
      expect(store().activeBlockId).toBe(b.id);
    }
  );

  it('inserts at a given index', () => {
    store().addBlock('HEADER');
    store().addBlock('TERMS');
    store().addBlock('PRICES', 1);
    expect(types()).toEqual(['HEADER', 'PRICES', 'TERMS']);
  });

  it('removes a block and clears it as active', () => {
    store().addBlock('HEADER');
    const id = store().blocks[0].id;
    store().removeBlock(id);
    expect(store().blocks).toEqual([]);
    expect(store().activeBlockId).toBeNull();
  });

  it('moves blocks', () => {
    store().addBlock('HEADER');
    store().addBlock('PRICES');
    store().addBlock('TERMS');
    store().moveBlock(0, 2);
    expect(types()).toEqual(['PRICES', 'TERMS', 'HEADER']);
  });

  it('duplicates a block right after the original, with a new id', () => {
    store().addBlock('HEADER');
    store().addBlock('PRICES');
    store().addBlock('TERMS');
    const header = store().blocks[0];
    store().duplicateBlock(header.id);
    expect(types()).toEqual(['HEADER', 'HEADER', 'PRICES', 'TERMS']);
    expect(store().blocks[1].id).not.toBe(header.id);
    expect(store().activeBlockId).toBe(store().blocks[1].id);
  });

  it('a duplicate is independent of the original', () => {
    store().addBlock('TERMS');
    const original = store().blocks[0];
    store().duplicateBlock(original.id);
    const copy = store().blocks[1];
    store().updateBlock(copy.id, { terms: ['Changed'] });
    expect((store().blocks[0].data as { terms: string[] }).terms).not.toEqual(['Changed']);
  });

  it('merges partial data on update', () => {
    store().addBlock('HEADER');
    const id = store().blocks[0].id;
    store().updateBlock(id, { companyName: 'ACME' });
    const data = store().blocks[0].data as { companyName: string; clientName: string };
    expect(data.companyName).toBe('ACME');
    expect(data.clientName).toBe('Client Name');
  });
});

describe('autosave state', () => {
  it('goes saving → saved → idle', async () => {
    vi.useFakeTimers();
    store().addBlock('TEXT');
    const id = store().blocks[0].id;

    store().updateBlockWithAutoSave(id, { content: 'hi' });
    expect(store().blocks[0].saveState).toBe('saving');

    await vi.advanceTimersByTimeAsync(1000);
    expect(store().blocks[0].saveState).toBe('saved');
    expect(store().lastSaved).toBeInstanceOf(Date);

    await vi.advanceTimersByTimeAsync(1000);
    expect(store().blocks[0].saveState).toBe('idle');
  });

  it('debounces rapid edits into one save', async () => {
    vi.useFakeTimers();
    const onSave = vi.fn(async () => {});
    store().addBlock('TEXT');
    const id = store().blocks[0].id;
    store().updateBlockWithAutoSave(id, { content: 'a' }, onSave);
    store().updateBlockWithAutoSave(id, { content: 'ab' }, onSave);
    store().updateBlockWithAutoSave(id, { content: 'abc' }, onSave);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows error when the save callback fails', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store().addBlock('TEXT');
    const id = store().blocks[0].id;
    store().updateBlockWithAutoSave(id, { content: 'x' }, async () => {
      throw new Error('offline');
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(store().blocks[0].saveState).toBe('error');
  });

  it('does not crash when the block is removed while saving', async () => {
    vi.useFakeTimers();
    store().addBlock('TEXT');
    const id = store().blocks[0].id;
    store().updateBlockWithAutoSave(id, { content: 'x' });
    store().removeBlock(id);
    await vi.advanceTimersByTimeAsync(3000);
    expect(store().blocks).toEqual([]);
  });
});

describe('undo / redo', () => {
  it('undoes and redoes structural changes', () => {
    store().addBlock('HEADER');
    store().addBlock('PRICES');
    expect(types()).toEqual(['HEADER', 'PRICES']);

    store().undo();
    expect(types()).toEqual(['HEADER']);
    store().undo();
    expect(types()).toEqual([]);
    store().redo();
    store().redo();
    expect(types()).toEqual(['HEADER', 'PRICES']);
  });

  it('restores a deleted block in place', () => {
    store().addBlock('HEADER');
    store().addBlock('PRICES');
    store().addBlock('TERMS');
    store().removeBlock(store().blocks[1].id);
    store().undo();
    expect(types()).toEqual(['HEADER', 'PRICES', 'TERMS']);
  });

  it('restores everything after clearing, including the quote id', () => {
    store().loadQuote('q1', 'My quote', [{ id: 'b1', type: 'TEXT', data: { content: 'x' } } as Block]);
    store().clearBuilder();
    expect(store().blocks).toEqual([]);
    expect(store().quoteId).toBeNull();
    store().undo();
    expect(store().quoteId).toBe('q1');
    expect(store().quoteTitle).toBe('My quote');
    expect(types()).toEqual(['TEXT']);
  });

  it('a new change clears the redo stack', () => {
    store().addBlock('HEADER');
    store().undo();
    store().addBlock('TEXT');
    store().redo();
    expect(types()).toEqual(['TEXT']);
  });

  it('coalesces typing in one block into a single step', () => {
    store().addBlock('TEXT');
    const id = store().blocks[0].id;
    store().updateBlock(id, { content: 'a' });
    store().updateBlock(id, { content: 'ab' });
    store().updateBlock(id, { content: 'abc' });
    store().undo();
    expect((store().blocks[0].data as { content: string }).content).toBe('Enter your text here...');
  });

  it('separates edits after a pause', () => {
    const now = vi.spyOn(Date, 'now');
    now.mockReturnValue(1_000_000);
    store().addBlock('TEXT');
    const id = store().blocks[0].id;
    store().updateBlock(id, { content: 'first' });
    now.mockReturnValue(1_000_000 + 5000);
    store().updateBlock(id, { content: 'second' });
    store().undo();
    expect((store().blocks[0].data as { content: string }).content).toBe('first');
  });

  it('separates edits in different blocks', () => {
    store().addBlock('TEXT');
    store().addBlock('TEXT');
    const [a, b] = store().blocks;
    store().updateBlock(a.id, { content: 'A' });
    store().updateBlock(b.id, { content: 'B' });
    store().undo();
    expect((store().blocks[0].data as { content: string }).content).toBe('A');
    expect((store().blocks[1].data as { content: string }).content).toBe('Enter your text here...');
  });

  it('does not restore transient save states', () => {
    vi.useFakeTimers();
    store().addBlock('TEXT');
    const id = store().blocks[0].id;
    store().updateBlockWithAutoSave(id, { content: 'x' });
    store().addBlock('HEADER');
    store().undo();
    expect(store().blocks[0].saveState).toBe('idle');
  });

  it('is a no-op with empty history', () => {
    store().undo();
    store().redo();
    expect(store().blocks).toEqual([]);
  });

  it('caps history at 50 steps', () => {
    for (let i = 0; i < 60; i++) store().addBlock('TEXT');
    expect(store().past.length).toBe(50);
  });

  it('loading a quote starts a fresh history', () => {
    store().addBlock('TEXT');
    store().loadQuote('q1', 'Q', []);
    expect(store().past).toEqual([]);
    store().undo();
    expect(store().quoteId).toBe('q1');
  });

  it('records what was removed so the UI can offer undo', () => {
    store().addBlock('PRICES');
    store().removeBlock(store().blocks[0].id);
    expect(store().lastRemoval).toMatchObject({ kind: 'block', blockType: 'PRICES' });
    const seq = store().lastRemoval!.seq;
    store().clearBuilder();
    expect(store().lastRemoval).toMatchObject({ kind: 'clear', seq: seq + 1 });
  });
});

describe('templates', () => {
  it('loads a template as a new, unsaved quote with fresh block ids', () => {
    store().loadQuote('existing', 'Existing', []);
    const blocks = [{ id: 'tpl-1', type: 'HEADER', data: {} }] as unknown as Block[];
    store().loadTemplate('t1', 'Web package', blocks);
    expect(store().quoteId).toBeNull();
    expect(store().quoteTitle).toBe('Web package - Copy');
    expect(store().blocks[0].id).not.toBe('tpl-1');
  });

  it('saveAsTemplate refuses an empty builder', async () => {
    const r = await store().saveAsTemplate('Empty');
    expect(r.success).toBe(false);
  });

  it('saveAsTemplate posts the blocks with the CSRF token', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 't9' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    store().addBlock('HEADER');
    const r = await store().saveAsTemplate('Mine', 'desc', 'csrf-abc');
    expect(r).toEqual({ success: true, templateId: 't9' });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/templates');
    expect((init.headers as Record<string, string>)['x-csrf-token']).toBe('csrf-abc');
    expect(JSON.parse(init.body as string).blocks).toHaveLength(1);
    vi.unstubAllGlobals();
  });

  it('saveAsTemplate never persists the UI save indicator or a null description', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 't1' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    store().addBlock('TEXT');
    store().updateBlockWithAutoSave(store().blocks[0].id, { content: 'x' }); // now "saving"
    await store().saveAsTemplate('Mine', undefined, 't');
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.blocks[0].saveState).toBeUndefined();
    expect('description' in body).toBe(false);
    vi.unstubAllGlobals();
  });

  it('saveAsTemplate reports server errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Nope' }), { status: 400 })));
    store().addBlock('HEADER');
    expect(await store().saveAsTemplate('Mine', undefined, 't')).toEqual({ success: false, error: 'Nope' });
    vi.unstubAllGlobals();
  });
});

describe('new quote', () => {
  it('startNewQuote empties the builder without an undo toast or history', () => {
    store().loadQuote('q1', 'Old quote', [{ id: 'b1', type: 'TEXT', data: {} } as unknown as Block]);
    store().addBlock('HEADER');
    store().startNewQuote();
    expect(store().blocks).toEqual([]);
    expect(store().quoteId).toBeNull();
    expect(store().quoteTitle).toBe('Untitled Quote');
    expect(store().past).toEqual([]);
    expect(store().lastRemoval).toBeNull();
  });
});

describe('saving', () => {
  it('serializeBlocks drops the save indicator and keeps the data', () => {
    const blocks = [{ id: 'a', type: 'TEXT', data: { content: 'x' }, saveState: 'saving' }] as unknown as Block[];
    expect(serializeBlocks(blocks)).toEqual([{ id: 'a', type: 'TEXT', data: { content: 'x' } }]);
  });

  it('markSaved sets the id and keeps blocks and undo history', () => {
    store().addBlock('HEADER');
    store().addBlock('TEXT');
    store().markSaved('q1');
    expect(store().quoteId).toBe('q1');
    store().undo();
    expect(types()).toEqual(['HEADER']);
  });

  it('loadQuote clears stale save indicators from stored data', () => {
    store().loadQuote('q1', 'Q', [{ id: 'a', type: 'TEXT', data: {}, saveState: 'saving' }] as unknown as Block[]);
    expect(store().blocks[0].saveState).toBe('idle');
  });
});
