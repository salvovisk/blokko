import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

function Probe() {
  const { t, locale, setLocale } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="title">{t.dashboard.quotes.title}</span>
      <button onClick={() => setLocale(locale === 'en' ? 'it' : 'en')}>toggle</button>
    </div>
  );
}

const setNavigatorLanguage = (lang: string) => Object.defineProperty(navigator, 'language', { value: lang, configurable: true });

afterEach(() => setNavigatorLanguage('en-US'));

describe('LanguageContext', () => {
  it('uses the stored choice first', () => {
    localStorage.setItem('blokko-locale', 'it');
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('title')).toHaveTextContent('I MIEI PREVENTIVI');
  });

  it('falls back to the browser language', () => {
    setNavigatorLanguage('it-IT');
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('locale')).toHaveTextContent('it');
  });

  it('defaults to English and ignores garbage in storage', () => {
    localStorage.setItem('blokko-locale', 'klingon');
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('switching persists the choice', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('title')).toHaveTextContent('I MIEI PREVENTIVI');
    expect(localStorage.getItem('blokko-locale')).toBe('it');
  });

  it('throws a clear error outside the provider', () => {
    expect(() => render(<Probe />)).toThrow(/LanguageProvider/);
  });
});
