import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import QuotesTable from '@/components/tables/QuotesTable';
import { renderWithProviders } from '../helpers/render';

const quotes = [
  { id: 'a', title: 'Bravo', description: 'Second', status: 'sent', createdAt: '2026-01-01', updatedAt: '2026-03-01T10:00:00Z' },
  { id: 'b', title: 'alpha', description: null, status: 'draft', createdAt: '2026-01-01', updatedAt: '2026-01-01T10:00:00Z' },
  { id: 'c', title: 'Charlie', description: null, status: 'accepted', createdAt: '2026-01-01', updatedAt: '2026-02-01T10:00:00Z' },
];

function setup(overrides = {}) {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onStatusChange: vi.fn() };
  renderWithProviders(<QuotesTable quotes={quotes} {...handlers} {...overrides} />);
  const titles = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
  return { ...handlers, titles };
}

describe('QuotesTable', () => {
  it('shows most recently updated first by default', () => {
    const { titles } = setup();
    expect(titles()).toEqual(['BravoSecond', 'Charlie', 'alpha']);
  });

  it('sorts by title case-insensitively, toggling direction', () => {
    const { titles } = setup();
    const button = screen.getByRole('button', { name: /title/i });
    fireEvent.click(button);
    expect(titles()).toEqual(['alpha', 'BravoSecond', 'Charlie']);
    expect(button.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(button);
    expect(titles()).toEqual(['Charlie', 'BravoSecond', 'alpha']);
  });

  it('sorts by status in lifecycle order', () => {
    const { titles } = setup();
    fireEvent.click(screen.getByRole('button', { name: /status/i }));
    expect(titles()).toEqual(['alpha', 'BravoSecond', 'Charlie']);
  });

  it('changes status inline', () => {
    const { onStatusChange } = setup();
    fireEvent.change(screen.getByRole('combobox', { name: /Bravo/ }), { target: { value: 'rejected' } });
    expect(onStatusChange).toHaveBeenCalledWith('a', 'rejected');
  });

  it('edits and deletes the right quote', () => {
    const { onEdit, onDelete } = setup();
    const row = screen.getByText('Charlie').closest('tr')!;
    fireEvent.click(within(row).getByRole('button', { name: /edit/i }));
    fireEvent.click(within(row).getByRole('button', { name: /delete/i }));
    expect(onEdit).toHaveBeenCalledWith('c');
    expect(onDelete).toHaveBeenCalledWith('c');
  });
});
