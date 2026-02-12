'use client';

import ThemeRegistry from './ThemeRegistry';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeRegistry>{children}</ThemeRegistry>
    </LanguageProvider>
  );
}
