'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
        <div style={{ border: '3px solid #000', background: '#FFF', padding: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '32px', textAlign: 'center' }}>
            BLOKKO
          </h1>
          <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '32px' }}>
            REGISTER
          </h2>

          {error && (
            <div style={{ padding: '16px', background: '#FFE5E5', border: '2px solid #FF0000', marginBottom: '24px', fontSize: '14px', color: '#CC0000' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '8px', textTransform: 'uppercase' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '2px solid #000', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '8px', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '2px solid #000', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '8px', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '12px', border: '2px solid #000', fontSize: '14px', fontFamily: 'inherit' }}
              />
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                Minimum 6 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? '#666' : '#000',
                color: '#FFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px' }}>
            <span style={{ color: '#666' }}>Already have an account? </span>
            <Link href="/login" style={{ color: '#000', fontWeight: 700, textDecoration: 'underline' }}>
              Login
            </Link>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #EEE', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
