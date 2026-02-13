'use client';

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div
        style={{
          border: '3px solid #000',
          background: '#FFF',
          padding: '60px 80px',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '24px',
            lineHeight: 1,
          }}
        >
          ▨
        </div>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '16px',
            margin: 0,
          }}
        >
          SETTINGS
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: 1.6,
            marginTop: '16px',
          }}
        >
          Manage your account and preferences. Coming soon.
        </p>
      </div>
    </div>
  );
}
