'use client';

import { useState, useEffect } from 'react';

interface AuthInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  success?: boolean;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  pattern?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

export default function AuthInput({
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  success,
  required,
  autoComplete,
  minLength,
  pattern,
  placeholder,
  helperText,
  disabled,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [error]);

  const getBorderColor = () => {
    if (disabled) return '#CCC';
    if (showError) return '#DC2626';
    if (success) return '#000';
    if (isFocused) return '#000';
    return '#000';
  };

  const getBorderWidth = () => {
    if (showError) return '3px';
    if (isFocused) return '3px';
    return '2px';
  };

  return (
    <div style={{ marginBottom: '28px', position: 'relative' }}>
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          marginBottom: '10px',
          textTransform: 'uppercase',
          color: showError ? '#DC2626' : '#000',
          transition: 'color 0.2s ease',
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>
        )}
      </label>

      {/* Input Container */}
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          pattern={pattern}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: `${getBorderWidth()} solid ${getBorderColor()}`,
            fontSize: '15px',
            fontFamily: 'inherit',
            background: disabled ? '#F5F5F5' : '#FFF',
            color: disabled ? '#999' : '#000',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxSizing: 'border-box',
            animation: showError ? 'shake 0.4s ease' : 'none',
          }}
        />

        {/* Success Indicator */}
        {success && !showError && (
          <div
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              border: '2px solid #000',
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'checkmark 0.3s ease',
            }}
          >
            <svg
              width="12"
              height="10"
              viewBox="0 0 12 10"
              fill="none"
              style={{
                animation: 'draw 0.3s ease 0.1s forwards',
                strokeDasharray: '20',
                strokeDashoffset: '20',
              }}
            >
              <path
                d="M1 5L4.5 8.5L11 1.5"
                stroke="#FFF"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !showError && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#666',
            letterSpacing: '0.02em',
            lineHeight: 1.4,
          }}
        >
          {helperText}
        </div>
      )}

      {/* Error Message */}
      {showError && error && (
        <div
          style={{
            marginTop: '10px',
            padding: '12px 14px',
            background: '#FEF2F2',
            border: '2px solid #DC2626',
            fontSize: '12px',
            fontWeight: 500,
            color: '#DC2626',
            letterSpacing: '0.01em',
            animation: 'slideDown 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
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
          <div style={{ paddingLeft: '8px' }}>{error}</div>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
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

        @keyframes checkmark {
          from {
            opacity: 0;
            transform: translateY(-50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
