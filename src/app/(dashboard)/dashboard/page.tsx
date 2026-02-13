'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 style={{ fontSize: '48px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
        DASHBOARD
      </h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '48px', fontWeight: 500 }}>
        Welcome back, {session?.user?.name || session?.user?.email}!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Quotes Card */}
        <div style={{ border: '3px solid #000', background: '#FFF', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>▦</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
            MY QUOTES
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
            Create, manage, and send professional quotes to your clients.
          </p>
          <div style={{ padding: '12px 24px', background: '#000', color: '#FFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textAlign: 'center', textTransform: 'uppercase', opacity: 0.5 }}>
            COMING SOON
          </div>
        </div>

        {/* Templates Card */}
        <div style={{ border: '3px solid #000', background: '#FFF', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>◼</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
            TEMPLATES
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
            Save and reuse your best quote structures as templates.
          </p>
          <div style={{ padding: '12px 24px', background: '#000', color: '#FFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textAlign: 'center', textTransform: 'uppercase', opacity: 0.5 }}>
            COMING SOON
          </div>
        </div>

        {/* Settings Card */}
        <div style={{ border: '3px solid #000', background: '#FFF', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>▨</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
            SETTINGS
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
            Manage your account, preferences, and billing information.
          </p>
          <div style={{ padding: '12px 24px', background: '#000', color: '#FFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textAlign: 'center', textTransform: 'uppercase', opacity: 0.5 }}>
            COMING SOON
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div style={{ marginTop: '64px', border: '3px solid #000', background: '#FFF', padding: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
          AUTHENTICATION ENABLED
        </h3>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, marginBottom: '24px' }}>
          This is the <strong>auth-enabled</strong> branch. Login and registration are fully functional with secure password hashing and session management.
        </p>
        <div style={{ background: '#FAFAFA', padding: '24px', border: '2px solid #EEE' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '12px', textTransform: 'uppercase', color: '#666' }}>
            YOUR SESSION INFO:
          </div>
          <div style={{ fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.8 }}>
            <div><strong>User ID:</strong> {session?.user?.id}</div>
            <div><strong>Email:</strong> {session?.user?.email}</div>
            <div><strong>Name:</strong> {session?.user?.name || 'Not set'}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Back to Landing Page
        </Link>
      </div>
    </div>
  );
}
