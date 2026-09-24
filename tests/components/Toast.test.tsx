import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import Toast from '@/components/ui/Toast';
import { renderWithProviders } from '../helpers/render';

afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('shows the message politely for success', () => {
    renderWithProviders(<Toast message="Quote saved" type="success" onClose={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Quote saved');
  });

  it('announces errors assertively', () => {
    renderWithProviders(<Toast message="Couldn't save" type="error" onClose={() => {}} />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('closes from the close button', () => {
    const onClose = vi.fn();
    renderWithProviders(<Toast message="Hi" type="info" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    renderWithProviders(<Toast message="Hi" type="info" onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('runs the action and then closes', () => {
    const onClose = vi.fn();
    const undo = vi.fn();
    renderWithProviders(<Toast message="Deleted" type="info" onClose={onClose} action={{ label: 'UNDO', onClick: undo }} />);
    fireEvent.click(screen.getByRole('button', { name: 'UNDO' }));
    expect(undo).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it.each([
    ['success', undefined, 3000],
    ['error', undefined, 7000],
    ['info', { label: 'UNDO', onClick: () => {} }, 6000],
  ] as const)('auto-dismisses a %s toast after the right delay', (type, action, ms) => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    renderWithProviders(<Toast message="x" type={type} onClose={onClose} action={action} />);
    act(() => vi.advanceTimersByTime(ms - 50));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(100));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('pauses while hovered', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    renderWithProviders(<Toast message="x" type="success" onClose={onClose} />);
    fireEvent.mouseEnter(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(10_000));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(3100));
    expect(onClose).toHaveBeenCalled();
  });
});
