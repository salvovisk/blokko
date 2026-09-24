'use client';

import { useEffect, useState } from 'react';

/** "⌘" on Apple platforms, "Ctrl" elsewhere. Resolves after mount to avoid hydration mismatch. */
export function useModifierKey(): string {
  const [mod, setMod] = useState('Ctrl');
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setMod('⌘');
  }, []);
  return mod;
}
