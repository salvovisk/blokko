import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import QuoteStatusSelect, { normalizeStatus, statusStyle } from '@/components/ui/QuoteStatusSelect';
import { renderWithProviders } from '../helpers/render';

describe('QuoteStatusSelect', () => {
  it('lists the four statuses in lifecycle order', () => {
    renderWithProviders(<QuoteStatusSelect value="draft" onChange={() => {}} />);
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Draft', 'Sent', 'Accepted', 'Rejected']);
  });

  it('is translated', () => {
    renderWithProviders(<QuoteStatusSelect value="sent" onChange={() => {}} />, { locale: 'it' });
    expect(screen.getByRole('combobox')).toHaveDisplayValue('Inviato');
  });

  it('reports the chosen status', () => {
    const onChange = vi.fn();
    renderWithProviders(<QuoteStatusSelect value="draft" onChange={onChange} label="Status of Q1" />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Status of Q1' }), { target: { value: 'accepted' } });
    expect(onChange).toHaveBeenCalledWith('accepted');
  });

  it('treats unknown or legacy values as draft', () => {
    expect(normalizeStatus('EXPIRED')).toBe('draft');
    expect(normalizeStatus('SENT')).toBe('sent');
  });

  it('uses the error red only for rejected', () => {
    expect(String(statusStyle('rejected').color).toUpperCase()).toBe('#D00000');
    for (const s of ['draft', 'sent', 'accepted']) {
      expect(String(statusStyle(s).color).toUpperCase()).not.toBe('#D00000');
    }
  });
});
