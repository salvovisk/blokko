import type { Metadata } from 'next';
import Providers from '@/components/ui/Providers';
import '@/styles/swiss-globals.css';

export const metadata: Metadata = {
  title: 'BLOKKO - Precision Quote Builder',
  description: 'Build professional quotes block by block. A brutally simple quote builder for freelancers, agencies, and consultants.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
