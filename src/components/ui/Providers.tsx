'use client';

import { SessionProvider } from 'next-auth/react';
import ThemeRegistry from './ThemeRegistry';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ThemeRegistry>{children}</ThemeRegistry>
      </LanguageProvider>
    </SessionProvider>
  );
}
