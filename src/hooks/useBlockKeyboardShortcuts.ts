'use client';

import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  onCommandPalette: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const useBlockKeyboardShortcuts = (
  handlers: KeyboardShortcutHandlers,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect if we're on Mac or Windows/Linux
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ignore shortcuts if user is typing in an input (except for specific cases)
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Command Palette: Cmd/Ctrl + K (works everywhere)
      if (modifier && e.key === 'k') {
        e.preventDefault();
        handlers.onCommandPalette();
        return;
      }

      // Escape: Cancel / clear active block (works everywhere)
      if (e.key === 'Escape') {
        e.preventDefault();
        handlers.onCancel();
        return;
      }

      // Save: Cmd/Ctrl + Enter (only in inputs)
      if (modifier && e.key === 'Enter' && isInput) {
        e.preventDefault();
        handlers.onSave();
        return;
      }

      // Block manipulation shortcuts (only when NOT in input)
      if (!isInput) {
        // Duplicate: Cmd/Ctrl + D
        if (modifier && e.key === 'd') {
          e.preventDefault();
          handlers.onDuplicate();
          return;
        }

        // Delete: Cmd/Ctrl + Backspace
        if (modifier && e.key === 'Backspace') {
          e.preventDefault();
          handlers.onDelete();
          return;
        }

        // Move Up: Cmd/Ctrl + ArrowUp
        if (modifier && e.key === 'ArrowUp') {
          e.preventDefault();
          handlers.onMoveUp();
          return;
        }

        // Move Down: Cmd/Ctrl + ArrowDown
        if (modifier && e.key === 'ArrowDown') {
          e.preventDefault();
          handlers.onMoveDown();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
};
