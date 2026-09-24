import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import BuilderSidebar from '@/components/builder/BuilderSidebar';
import { useBuilderStore } from '@/stores/builder-store';
import { renderWithProviders } from '../helpers/render';

const types = () => useBuilderStore.getState().blocks.map((b) => b.type);
const initial = useBuilderStore.getState();

beforeEach(() => {
  useBuilderStore.setState(initial, true);
  renderWithProviders(
    <DndContext>
      <BuilderSidebar />
    </DndContext>
  );
});

describe('BuilderSidebar', () => {
  it('groups the 11 blocks under Structure, Money and Closing', () => {
    expect(screen.getByRole('heading', { name: 'STRUCTURE' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'MONEY' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CLOSING' })).toBeInTheDocument();
    expect(document.querySelectorAll('.sidebar-block')).toHaveLength(11);
  });

  it('adds a block on click', () => {
    fireEvent.click(screen.getByRole('button', { name: /^Prices:/ }));
    expect(types()).toEqual(['PRICES']);
  });

  it('adds a block with Enter and Space', () => {
    fireEvent.keyDown(screen.getByRole('button', { name: /^Header:/ }), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('button', { name: /^Terms:/ }), { key: ' ' });
    expect(types()).toEqual(['HEADER', 'TERMS']);
  });

  it('names each block with its description for screen readers', () => {
    expect(screen.getByRole('button', { name: /Signature: Client approval/ })).toBeInTheDocument();
  });
});
