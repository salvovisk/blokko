import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { render } from '@testing-library/react';
import PricesBlock, { computeTotals, toCents } from '@/components/blocks/PricesBlock';
import { useBuilderStore } from '@/stores/builder-store';
import type { PricesBlock as PricesBlockType } from '@/types/blocks';

/** Renders the block the way the canvas does: always from the latest store state. */
function Harness() {
  const block = useBuilderStore((s) => s.blocks[0]) as PricesBlockType;
  return <PricesBlock block={block} isActive />;
}

const data = () => (useBuilderStore.getState().blocks[0] as PricesBlockType).data;
const initial = useBuilderStore.getState();

beforeEach(() => {
  useBuilderStore.setState(initial, true);
  act(() => useBuilderStore.getState().addBlock('PRICES'));
  render(<Harness />);
});

function addRow(qty: string, price: string) {
  fireEvent.click(screen.getByRole('button', { name: /add row/i }));
  const q = screen.getAllByRole('spinbutton', { name: 'Quantity' }).at(-1)!;
  const p = screen.getAllByRole('spinbutton', { name: 'Unit price' }).at(-1)!;
  fireEvent.change(q, { target: { value: qty } });
  fireEvent.change(p, { target: { value: price } });
}

describe('PricesBlock', () => {
  it('computes line total, 22% tax and grand total', () => {
    addRow('2', '150');
    expect(data().items[0].total).toBe(300);
    expect(data()).toMatchObject({ subtotal: 300, tax: 66, total: 366 });
    expect(screen.getByText('€366.00')).toBeInTheDocument();
  });

  it('sums several rows', () => {
    addRow('1', '100');
    addRow('3', '10.5');
    expect(data()).toMatchObject({ subtotal: 131.5, tax: 28.93, total: 160.43 });
  });

  it('recalculates when a row is removed', () => {
    addRow('1', '100');
    addRow('1', '50');
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove row' })[0]);
    expect(data().items).toHaveLength(1);
    expect(data()).toMatchObject({ subtotal: 50, tax: 11, total: 61 });
  });

  it('recalculates when the tax rate changes', () => {
    addRow('1', '200');
    fireEvent.change(screen.getByRole('spinbutton', { name: /tax rate/i }), { target: { value: '10' } });
    expect(data()).toMatchObject({ taxRate: 10, tax: 20, total: 220 });
  });

  it('excludes tax from the total when tax is hidden, and restores it', () => {
    addRow('1', '100');
    fireEvent.click(screen.getByRole('checkbox', { name: /show tax/i }));
    expect(data()).toMatchObject({ showTax: false, total: 100 });
    fireEvent.click(screen.getByRole('checkbox', { name: /show tax/i }));
    expect(data()).toMatchObject({ showTax: true, total: 122 });
  });

  it('keeps tax correct after hiding it and changing items meanwhile', () => {
    addRow('1', '100');
    fireEvent.click(screen.getByRole('checkbox', { name: /show tax/i }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Unit price' }), { target: { value: '300' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /show tax/i }));
    expect(data()).toMatchObject({ subtotal: 300, tax: 66, total: 366 });
  });

  it('treats empty and negative amounts as zero', () => {
    addRow('', '-50');
    expect(data().items[0]).toMatchObject({ quantity: 0, price: 0, total: 0 });
  });
});

describe('money math', () => {
  it('rounds to cents', () => {
    expect(toCents(0.1 + 0.2)).toBe(0.3);
    expect(toCents(2.675)).toBe(2.68);
  });

  it('subtotal + tax always equals the total shown', () => {
    for (const price of [10.25, 33.33, 19.99, 0.05, 1234.565]) {
      const { subtotal, tax, total } = computeTotals([{ id: 'x', description: '', quantity: 1, price, total: toCents(price) }], 22, true);
      expect(toCents(subtotal + tax)).toBe(total);
    }
  });
});
