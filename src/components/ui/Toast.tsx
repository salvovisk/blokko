'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: { bg: '#10B981', border: '#059669' },
    error: { bg: '#EF4444', border: '#DC2626' },
    info: { bg: '#3B82F6', border: '#2563EB' },
  };

  const { bg, border } = colors[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '16px 32px',
        backgroundColor: bg,
        color: '#FFFFFF',
        fontWeight: 700,
        textAlign: 'center',
        fontSize: '13px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        zIndex: 10000,
        border: `3px solid ${border}`,
        boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 0.3)',
        minWidth: '300px',
        maxWidth: '90vw',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      {message}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
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
