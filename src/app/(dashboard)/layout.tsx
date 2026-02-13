'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/navigation/DashboardSidebar';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {t.common.loading}
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <header style={{ background: '#000', color: '#FFF', padding: '16px 24px', borderBottom: '3px solid #000', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <Link href="/quotes" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.15em', textDecoration: 'none', color: '#FFF' }}>
            BLOKKO
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              padding: '8px 24px',
              background: 'transparent',
              border: '2px solid #FFF',
              color: '#FFF',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFF';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#FFF';
            }}
          >
            {t.dashboard.nav.logout}
          </button>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <DashboardSidebar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
