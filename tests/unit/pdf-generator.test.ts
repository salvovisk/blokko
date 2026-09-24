import { describe, it, expect, beforeEach } from 'vitest';
import { generatePDF } from '@/lib/pdf-generator';
import { useBuilderStore } from '@/stores/builder-store';
import type { Block, BlockType } from '@/types/blocks';

const ALL: BlockType[] = ['HEADER', 'PRICES', 'TEXT', 'TERMS', 'FAQ', 'TABLE', 'TIMELINE', 'CONTACT', 'DISCOUNT', 'PAYMENT', 'SIGNATURE'];

async function pdfText(blob: Blob) {
  return Buffer.from(await blob.arrayBuffer()).toString('latin1');
}

/** Blocks built exactly as the builder creates them */
function defaultBlocks(): Block[] {
  const initial = useBuilderStore.getState();
  useBuilderStore.setState(initial, true);
  ALL.forEach((t) => useBuilderStore.getState().addBlock(t));
  return useBuilderStore.getState().blocks;
}

describe('generatePDF', () => {
  beforeEach(() => {
    useBuilderStore.setState({ blocks: [] });
  });

  it('produces a PDF document', async () => {
    const blob = generatePDF({ title: 'Quote', blocks: [] });
    expect((await pdfText(blob)).startsWith('%PDF')).toBe(true);
  });

  it('renders every block type with the builder defaults', async () => {
    const blob = generatePDF({ title: 'Quote', blocks: defaultBlocks() });
    expect(blob.size).toBeGreaterThan(1000);
  });

  it.each(ALL)('does not crash on a %s block with empty data', (type) => {
    expect(() => generatePDF({ title: 'Q', blocks: [{ id: 'x', type, data: {} } as unknown as Block] })).not.toThrow();
  });

  it('includes line items and totals', async () => {
    const blocks = [
      {
        id: 'p',
        type: 'PRICES',
        data: {
          items: [{ id: 'i1', description: 'Design', quantity: 2, price: 150, total: 300 }],
          currency: 'EUR',
          taxRate: 22,
          showTax: true,
          subtotal: 300,
          tax: 66,
          total: 366,
        },
      },
    ] as unknown as Block[];
    const text = await pdfText(generatePDF({ title: 'Q', blocks }));
    expect(text).toContain('Design');
    expect(text).toContain('366.00');
  });

  it('adds pages for long quotes', async () => {
    const items = Array.from({ length: 120 }, (_, i) => ({ id: `i${i}`, description: `Item ${i}`, quantity: 1, price: 1, total: 1 }));
    const blocks = [
      { id: 'p', type: 'PRICES', data: { items, currency: 'EUR', taxRate: 0, showTax: false, subtotal: 120, tax: 0, total: 120 } },
      { id: 't', type: 'TEXT', data: { content: 'Lorem ipsum dolor sit amet. '.repeat(400) } },
    ] as unknown as Block[];
    const text = await pdfText(generatePDF({ title: 'Q', blocks }));
    const pages = text.match(/\/Type \/Page\b/g) ?? [];
    expect(pages.length).toBeGreaterThan(2);
  });
});
