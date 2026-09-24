import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import SaveTemplateModal from '@/components/modals/SaveTemplateModal';
import { renderWithProviders } from '../helpers/render';

function setup(onSave = vi.fn(async () => {})) {
  const onClose = vi.fn();
  renderWithProviders(<SaveTemplateModal open onClose={onClose} onSave={onSave} />);
  return { onSave, onClose };
}

describe('SaveTemplateModal', () => {
  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(<SaveTemplateModal open={false} onClose={() => {}} onSave={async () => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('requires a name', async () => {
    const { onSave } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'SAVE TEMPLATE' }));
    expect(await screen.findByText('Template name is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves trimmed values and closes', async () => {
    const { onSave, onClose } = setup();
    fireEvent.change(screen.getByPlaceholderText(/Standard Service Quote/), { target: { value: '  Retainer  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE TEMPLATE' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith('Retainer', undefined);
  });

  it('shows the server error and stays open', async () => {
    const { onClose } = setup(vi.fn(async () => { throw new Error('Name taken'); }));
    fireEvent.change(screen.getByPlaceholderText(/Standard Service Quote/), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE TEMPLATE' }));
    expect(await screen.findByText('Name taken')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
