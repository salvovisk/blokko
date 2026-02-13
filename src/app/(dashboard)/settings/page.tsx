'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { t, locale, setLocale } = useLanguage();
  const [name, setName] = useState(session?.user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showMessage('error', t.dashboard.settings.messages.nameEmpty);
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await update({ name: name.trim() });
      showMessage('success', t.dashboard.settings.messages.profileUpdated);
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', t.dashboard.settings.messages.profileFailed);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', t.dashboard.settings.messages.passwordRequired);
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', t.dashboard.settings.messages.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      showMessage('error', t.dashboard.settings.messages.passwordLength);
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'Current password is incorrect') {
          throw new Error(t.dashboard.settings.messages.passwordIncorrect);
        }
        throw new Error(t.dashboard.settings.messages.passwordFailed);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', t.dashboard.settings.messages.passwordChanged);
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', error instanceof Error ? error.message : t.dashboard.settings.messages.passwordFailed);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
          {t.dashboard.settings.title}
        </h1>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 32px',
            backgroundColor: message.type === 'success' ? '#10B981' : '#EF4444',
            color: '#FFFFFF',
            fontWeight: 700,
            textAlign: 'center',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            zIndex: 10000,
            border: '3px solid #000000',
            boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 0.3)',
            minWidth: '300px',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Language Section */}
      <div style={{ border: '3px solid #000', background: '#FFF', padding: 'clamp(20px, 5vw, 32px)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', borderBottom: '3px solid #000', paddingBottom: '12px' }}>
          {t.dashboard.settings.language.title}
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t.dashboard.settings.language.label}
          </label>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
            {t.dashboard.settings.language.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: locale === 'en' ? '#000' : '#666', transition: 'color 0.2s' }}>
            {t.dashboard.settings.language.english}
          </span>
          <button
            onClick={() => setLocale(locale === 'en' ? 'it' : 'en')}
            style={{
              position: 'relative',
              width: '72px',
              height: '36px',
              background: '#000',
              border: '3px solid #000',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s',
            }}
            aria-label={`Switch to ${locale === 'en' ? 'Italian' : 'English'}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0 0 rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: locale === 'en' ? '3px' : 'calc(100% - 33px)',
                width: '30px',
                height: '30px',
                background: '#FFF',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: locale === 'it' ? '#000' : '#666', transition: 'color 0.2s' }}>
            {t.dashboard.settings.language.italian}
          </span>
        </div>
      </div>

      {/* Profile Section */}
      <div style={{ border: '3px solid #000', background: '#FFF', padding: 'clamp(20px, 5vw, 32px)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', borderBottom: '3px solid #000', paddingBottom: '12px' }}>
          {t.dashboard.settings.profile.title}
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t.dashboard.settings.profile.emailLabel}
          </label>
          <input
            type="email"
            value={session?.user?.email || ''}
            disabled
            style={{
              width: '100%',
              padding: '12px',
              border: '3px solid #CCC',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: '#F5F5F5',
              color: '#666',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t.dashboard.settings.profile.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.dashboard.settings.profile.namePlaceholder}
            style={{
              width: '100%',
              padding: '12px',
              border: '3px solid #000',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: '#FFFFFF',
            }}
          />
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={isUpdatingProfile}
          style={{
            padding: '12px 24px',
            background: isUpdatingProfile ? '#666' : '#000',
            color: '#FFF',
            border: '3px solid #000',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isUpdatingProfile) {
              e.currentTarget.style.background = '#FFF';
              e.currentTarget.style.color = '#000';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUpdatingProfile) {
              e.currentTarget.style.background = '#000';
              e.currentTarget.style.color = '#FFF';
            }
          }}
        >
          {isUpdatingProfile ? t.dashboard.settings.profile.updating : t.dashboard.settings.profile.updateButton}
        </button>
      </div>

      {/* Change Password Section */}
      <div style={{ border: '3px solid #000', background: '#FFF', padding: 'clamp(20px, 5vw, 32px)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', borderBottom: '3px solid #000', paddingBottom: '12px' }}>
          {t.dashboard.settings.password.title}
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t.dashboard.settings.password.currentLabel}
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t.dashboard.settings.password.currentPlaceholder}
            style={{
              width: '100%',
              padding: '12px',
              border: '3px solid #000',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: '#FFFFFF',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t.dashboard.settings.password.newLabel}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t.dashboard.settings.password.newPlaceholder}
            style={{
              width: '100%',
              padding: '12px',
              border: '3px solid #000',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: '#FFFFFF',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {t.dashboard.settings.password.confirmLabel}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t.dashboard.settings.password.confirmPlaceholder}
            style={{
              width: '100%',
              padding: '12px',
              border: '3px solid #000',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: '#FFFFFF',
            }}
          />
        </div>

        <button
          onClick={handleChangePassword}
          disabled={isChangingPassword}
          style={{
            padding: '12px 24px',
            background: isChangingPassword ? '#666' : '#DC2626',
            color: '#FFF',
            border: '3px solid #DC2626',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: isChangingPassword ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isChangingPassword) {
              e.currentTarget.style.background = '#FFF';
              e.currentTarget.style.color = '#DC2626';
            }
          }}
          onMouseLeave={(e) => {
            if (!isChangingPassword) {
              e.currentTarget.style.background = '#DC2626';
              e.currentTarget.style.color = '#FFF';
            }
          }}
        >
          {isChangingPassword ? t.dashboard.settings.password.changing : t.dashboard.settings.password.changeButton}
        </button>
      </div>

    </div>
  );
}
