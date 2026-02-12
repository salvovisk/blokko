'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      style={{
        display: 'inline-flex',
        border: '2px solid #000',
        background: '#FFF',
      }}
    >
      <button
        onClick={() => setLocale('en')}
        style={{
          padding: '8px 16px',
          border: 'none',
          background: locale === 'en' ? '#000' : 'transparent',
          color: locale === 'en' ? '#FFF' : '#000',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          borderRight: '2px solid #000',
        }}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('it')}
        style={{
          padding: '8px 16px',
          border: 'none',
          background: locale === 'it' ? '#000' : 'transparent',
          color: locale === 'it' ? '#FFF' : '#000',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        IT
      </button>
    </div>
  );
}
