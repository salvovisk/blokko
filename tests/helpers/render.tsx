import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';

/** Render inside the app's language provider (English unless told otherwise). */
export function renderWithProviders(ui: ReactElement, { locale = 'en' }: { locale?: 'en' | 'it' } = {}) {
  localStorage.setItem('blokko-locale', locale);
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}
