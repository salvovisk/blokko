'use client';

interface PasswordStrengthProps {
  password: string;
  show: boolean;
}

export default function PasswordStrength({ password, show }: PasswordStrengthProps) {
  if (!show || !password) return null;

  const checks = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Number', test: /\d/.test(password) },
  ];

  const passedCount = checks.filter(c => c.test).length;
  const strength = passedCount === 4 ? 'strong' : passedCount >= 2 ? 'medium' : 'weak';

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '16px',
        border: '2px solid #000',
        background: '#FAFAFA',
        animation: 'slideDown 0.3s ease',
      }}
    >
      {/* Strength Indicator */}
      <div style={{ marginBottom: '14px' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '10px',
            color: '#000',
          }}
        >
          Password Strength
        </div>
        <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: i < passedCount ? '#000' : '#DDD',
                transition: 'all 0.3s ease',
                animation: i < passedCount ? `fillBar 0.3s ease ${i * 0.1}s backwards` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div style={{ display: 'grid', gap: '8px' }}>
        {checks.map((check, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: check.test ? '#000' : '#999',
              transition: 'color 0.2s ease',
              animation: check.test ? `fadeIn 0.3s ease ${i * 0.05}s backwards` : 'none',
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                border: '2px solid',
                borderColor: check.test ? '#000' : '#CCC',
                background: check.test ? '#000' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              {check.test && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path
                    d="M1 3L3 5L7 1"
                    stroke="#FFF"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              )}
            </div>
            <span style={{ fontWeight: check.test ? 600 : 400 }}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
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

        @keyframes fillBar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
