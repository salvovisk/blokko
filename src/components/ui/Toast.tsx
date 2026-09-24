'use client';

import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '@/components/icons/GeometricIcons';
import { useLanguage } from '@/contexts/LanguageContext';
import { swissTheme } from '@/styles/swiss-theme';
import type { ToastAction } from '@/hooks/useToast';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  action?: ToastAction;
  duration?: number;
}

const { colors } = swissTheme;

// Errors and undo offers stay long enough to read and act on.
function defaultDuration(type: ToastProps['type'], hasAction: boolean) {
  if (type === 'error') return 7000;
  if (hasAction) return 6000;
  return 3000;
}

export default function Toast({ message, type, onClose, action, duration }: ToastProps) {
  const { t } = useLanguage();
  const [paused, setPaused] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const ms = duration ?? defaultDuration(type, Boolean(action));

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onCloseRef.current(), ms);
    return () => clearTimeout(timer);
  }, [ms, paused, message]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const isError = type === 'error';
  const bg = isError ? colors.error : colors.black;

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      data-surface="dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{
        position: 'fixed',
        top: '88px', // below the black app header, where it stays readable
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: bg,
        color: colors.white,
        fontWeight: 700,
        fontSize: '13px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        zIndex: 10000,
        border: `3px solid ${bg}`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        minWidth: '300px',
        maxWidth: 'min(560px, calc(100vw - 32px))',
        animation: 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ flex: 1, padding: '14px 20px', lineHeight: 1.4 }}>{message}</span>

      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onClose();
          }}
          style={{
            border: 'none',
            borderLeft: `1px solid rgba(255, 255, 255, 0.4)`,
            background: 'transparent',
            color: colors.white,
            padding: '0 20px',
            font: 'inherit',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label={t.common.close}
        style={{
          border: 'none',
          borderLeft: `1px solid rgba(255, 255, 255, 0.4)`,
          background: 'transparent',
          color: colors.white,
          width: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        <CloseIcon />
      </button>

      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
