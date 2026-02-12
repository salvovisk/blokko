'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/i18n/en.json';
import it from '@/i18n/it.json';

type Locale = 'en' | 'it';

type Translations = typeof en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const translations: Record<Locale, Translations> = {
  en,
  it,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem('blokko-locale') as Locale;
    if (stored && (stored === 'en' || stored === 'it')) {
      setLocaleState(stored);
      return;
    }

    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('it')) {
      setLocaleState('it');
    } else {
      setLocaleState('en');
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('blokko-locale', newLocale);
  };

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
