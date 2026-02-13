'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '@/components/navigation/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          LOADING...
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
      <header style={{ background: '#000', color: '#FFF', padding: '16px 20px', borderBottom: '3px solid #000', zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link href="/dashboard" style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, letterSpacing: '0.15em', textDecoration: 'none', color: '#FFF' }}>
              BLOKKO
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 32px)' }}>
            <span style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', fontWeight: 600, letterSpacing: '0.1em', display: window.innerWidth < 768 ? 'none' : 'inline' }}>
              {session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 24px)',
                background: 'transparent',
                border: '2px solid #FFF',
                color: '#FFF',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '44px',
                minHeight: '44px',
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
              {window.innerWidth < 768 ? 'OUT' : 'LOGOUT'}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <DashboardSidebar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 4vw, 40px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
