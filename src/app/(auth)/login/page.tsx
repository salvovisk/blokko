'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthInput from '@/components/auth/AuthInput';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string): string | null => {
    if (!value) return t.auth.login.emailRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.auth.login.emailInvalid;
    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (!value) return t.auth.login.passwordRequired;
    return null;
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    const error = validateEmail(email);
    setErrors({ ...errors, email: error || undefined });
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    const error = validatePassword(password);
    setErrors({ ...errors, password: error || undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: t.auth.login.error });
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setErrors({ general: t.auth.login.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAFA',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          animation: 'fadeInUp 0.5s ease',
        }}
      >
        {/* Main Card */}
        <div
          style={{
            border: '3px solid #000',
            background: '#FFF',
            padding: '48px 40px',
            position: 'relative',
          }}
        >
          {/* Logo/Brand */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              {t.common.blokko}
            </h1>
            <div
              style={{
                width: '60px',
                height: '3px',
                background: '#000',
                margin: '0 auto',
              }}
            />
          </div>

          {/* Section Title */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              {t.auth.login.title}
            </h2>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {t.auth.login.subtitle}
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div
              style={{
                padding: '16px 18px',
                background: '#FEF2F2',
                border: '3px solid #DC2626',
                marginBottom: '28px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#DC2626',
                letterSpacing: '0.02em',
                animation: 'slideDown 0.3s ease',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: '#DC2626',
                }}
              />
              <div style={{ paddingLeft: '12px' }}>{errors.general}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AuthInput
              label={t.auth.login.email}
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={handleEmailBlur}
              error={touched.email ? errors.email : null}
              success={touched.email && !errors.email && !!email}
              required
              autoComplete="email"
              placeholder={t.auth.login.emailPlaceholder}
            />

            <AuthInput
              label={t.auth.login.password}
              type="password"
              value={password}
              onChange={setPassword}
              onBlur={handlePasswordBlur}
              error={touched.password ? errors.password : null}
              success={touched.password && !errors.password && !!password}
              required
              autoComplete="current-password"
              placeholder={t.auth.login.passwordPlaceholder}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                background: loading ? '#666' : '#000',
                color: '#FFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#000';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ animation: 'pulse 1s ease infinite' }}>●</span>
                  {t.auth.login.submitting}
                </span>
              ) : (
                t.auth.login.submit
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '28px',
              borderTop: '2px solid #F0F0F0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              {t.auth.login.noAccount}{' '}
              <Link
                href="/register"
                style={{
                  color: '#000',
                  fontWeight: 700,
                  textDecoration: 'none',
                  borderBottom: '2px solid #000',
                  paddingBottom: '2px',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {t.auth.login.createAccount}
              </Link>
            </div>

            <Link
              href="/"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#999',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'color 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#000')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
            >
              {t.auth.login.backToHome}
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#999',
            letterSpacing: '0.05em',
          }}
        >
          {t.auth.login.secureAuth}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
