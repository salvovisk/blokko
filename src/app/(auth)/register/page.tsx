'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCsrf, withCsrf } from '@/hooks/useCsrf';
import AuthInput from '@/components/auth/AuthInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { token: csrfToken } = useCsrf();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; password: boolean }>({
    name: false,
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);

  const validateName = (value: string): string | null => {
    if (!value.trim()) return t.auth.register.nameRequired;
    if (value.length > 100) return t.auth.register.nameTooLong;
    if (/\d/.test(value)) return t.auth.register.nameNoNumbers;
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value) return t.auth.register.emailRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t.auth.register.emailInvalid;
    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (value.length < 8) return t.auth.register.passwordMinLength;
    if (!/[a-z]/.test(value)) return t.auth.register.passwordLowercase;
    if (!/[A-Z]/.test(value)) return t.auth.register.passwordUppercase;
    if (!/\d/.test(value)) return t.auth.register.passwordNumber;
    return null;
  };

  const isPasswordValid = (value: string): boolean => {
    return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
  };

  const handleNameBlur = () => {
    setTouched({ ...touched, name: true });
    const error = validateName(name);
    setErrors({ ...errors, name: error || undefined });
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    const error = validateEmail(email);
    setErrors({ ...errors, email: error || undefined });
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Real-time validation for password
    if (touched.password) {
      const error = validatePassword(value);
      setErrors({ ...errors, password: error || undefined });
    }
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    const error = validatePassword(password);
    setErrors({ ...errors, password: error || undefined });
    setShowPasswordStrength(false);
  };

  const handlePasswordFocus = () => {
    setShowPasswordStrength(true);
    setTouched({ ...touched, password: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ name: true, email: true, password: true });

    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', withCsrf(csrfToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      }));

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || 'Registration failed' });
      } else {
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'An error occurred. Please try again.' });
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
              {t.auth.register.title}
            </h2>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {t.auth.register.subtitle}
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
              label={t.auth.register.name}
              type="text"
              value={name}
              onChange={(value) => {
                // Prevent numbers from being entered
                const filtered = value.replace(/\d/g, '');
                setName(filtered);
              }}
              onBlur={handleNameBlur}
              error={touched.name ? errors.name : null}
              success={touched.name && !errors.name && !!name}
              required
              autoComplete="name"
              placeholder={t.auth.register.namePlaceholder}
            />

            <AuthInput
              label={t.auth.register.email}
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={handleEmailBlur}
              error={touched.email ? errors.email : null}
              success={touched.email && !errors.email && !!email}
              required
              autoComplete="email"
              placeholder={t.auth.register.emailPlaceholder}
            />

            <div onClick={handlePasswordFocus}>
              <AuthInput
                label={t.auth.register.password}
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                error={null}
                success={touched.password && !errors.password && isPasswordValid(password)}
                required
                autoComplete="new-password"
                placeholder={t.auth.register.passwordPlaceholder}
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
              />
              <PasswordStrength password={password} show={showPasswordStrength} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name || !email || !isPasswordValid(password) || !!errors.name || !!errors.email}
              style={{
                width: '100%',
                padding: '18px',
                background: loading || !name || !email || !isPasswordValid(password) || !!errors.name || !!errors.email ? '#666' : '#000',
                color: '#FFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: loading || !name || !email || !isPasswordValid(password) || !!errors.name || !!errors.email ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '8px',
                position: 'relative',
                overflow: 'hidden',
                opacity: loading || !name || !email || !isPasswordValid(password) || !!errors.name || !!errors.email ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && name && email && isPasswordValid(password) && !errors.name && !errors.email) {
                  e.currentTarget.style.background = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && name && email && isPasswordValid(password) && !errors.name && !errors.email) {
                  e.currentTarget.style.background = '#000';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ animation: 'pulse 1s ease infinite' }}>●</span>
                  {t.auth.register.submitting}
                </span>
              ) : (
                t.auth.register.submit
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
              {t.auth.register.hasAccount}{' '}
              <Link
                href="/login"
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
                {t.auth.register.signIn}
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
              {t.auth.register.backToHome}
            </Link>
          </div>
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
