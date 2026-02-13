'use client';

import { useState } from 'react';
import Link from 'next/link';

type AnimationType = 'crossout' | 'flash' | 'strikethrough' | 'implode';

interface DemoBlockProps {
  title: string;
  description: string;
  animationType: AnimationType;
}

function DemoBlock({ title, description, animationType }: DemoBlockProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Reset after animation completes
    setTimeout(() => {
      setIsDeleted(true);
      setTimeout(() => {
        setIsDeleting(false);
        setIsDeleted(false);
      }, 500);
    }, 600);
  };

  const getAnimationStyles = () => {
    if (!isDeleting) return {};

    const baseStyle = {
      animationDuration: '0.6s',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      animationFillMode: 'forwards' as const,
    };

    switch (animationType) {
      case 'crossout':
        return {
          ...baseStyle,
          animation: 'crossoutDelete 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        };
      case 'flash':
        return {
          ...baseStyle,
          animation: 'flashDelete 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        };
      case 'strikethrough':
        return {
          ...baseStyle,
          animation: 'strikethroughDelete 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        };
      case 'implode':
        return {
          ...baseStyle,
          animation: 'implodeDelete 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        };
      default:
        return baseStyle;
    }
  };

  if (isDeleted) {
    return (
      <div
        style={{
          border: '3px dashed #CCC',
          padding: '40px',
          textAlign: 'center',
          background: '#FAFAFA',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>×</div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#999',
          }}
        >
          DELETED
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes crossoutDelete {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            40% {
              transform: scale(0.98);
              opacity: 0.9;
            }
            70% {
              transform: scale(0.96) scaleY(0.6);
              opacity: 0.6;
            }
            100% {
              transform: scale(0.94) scaleY(0);
              opacity: 0;
            }
          }

          @keyframes flashDelete {
            0% {
              background-color: #FFFFFF;
              transform: scale(1);
              opacity: 1;
            }
            25% {
              background-color: #000000;
              transform: scale(0.98);
            }
            50% {
              background-color: #FFFFFF;
              transform: scale(0.96) scaleX(1.05);
            }
            75% {
              background-color: #000000;
              transform: scale(0.94) scaleX(1.08) scaleY(0.5);
              opacity: 0.7;
            }
            100% {
              background-color: #000000;
              transform: scale(0.92) scaleX(1.1) scaleY(0);
              opacity: 0;
            }
          }

          @keyframes strikethroughDelete {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            40% {
              opacity: 0.8;
              transform: scale(0.99);
            }
            70% {
              opacity: 0.5;
              transform: scale(0.97) scaleY(0.5);
            }
            100% {
              opacity: 0;
              transform: scale(0.95) scaleY(0);
            }
          }

          @keyframes implodeDelete {
            0% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: scale(0.9) rotate(2deg);
              opacity: 0.8;
            }
            100% {
              transform: scale(0) rotate(90deg);
              opacity: 0;
            }
          }

          @keyframes crossoutLine {
            0% {
              opacity: 0;
              transform: scale(0.7);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes strikethroughLine {
            0% {
              transform: scaleX(0);
              opacity: 0;
            }
            100% {
              transform: scaleX(1);
              opacity: 1;
            }
          }

          @keyframes flashLine {
            0% {
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Cross-out X overlay */}
      {isDeleting && animationType === 'crossout' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: '80px',
              fontWeight: 700,
              color: '#000000',
              animation: 'crossoutLine 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards',
              opacity: 0,
            }}
          >
            ×
          </div>
        </div>
      )}

      {/* Flash lines overlay */}
      {isDeleting && animationType === 'flash' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: '3px',
              backgroundColor: '#FFFFFF',
              animation: 'flashLine 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      )}

      {/* Strike-through lines overlay */}
      {isDeleting && animationType === 'strikethrough' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '12px',
            padding: '0 16px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: i === 1 ? '4px' : '2px',
                backgroundColor: '#000000',
                transformOrigin: 'left',
                animation: `strikethroughLine 0.2s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s forwards`,
                transform: 'scaleX(0)',
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          border: '3px solid #000000',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          ...getAnimationStyles(),
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            borderBottom: '3px solid #000000',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '4px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              opacity: 0.8,
            }}
          >
            {description}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px', fontSize: '14px', lineHeight: 1.6 }}>
            This is a sample block demonstrating the <strong>{title}</strong> animation.
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              padding: '12px 24px',
              backgroundColor: isDeleting ? '#666666' : '#DC2626',
              border: '3px solid #000000',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#991B1B';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '4px 4px 0 0 rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#DC2626';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isDeleting ? 'DELETING...' : '× DELETE THIS BLOCK'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnimationsShowcasePage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Link
            href="/builder"
            style={{
              fontSize: '24px',
              textDecoration: 'none',
              color: '#000',
            }}
          >
            ←
          </Link>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              margin: 0,
            }}
          >
            DELETE ANIMATIONS
          </h1>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Choose your preferred deletion animation style
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        <DemoBlock
          title="Cross-Out"
          description="Simple X mark, clean collapse"
          animationType="crossout"
        />

        <DemoBlock
          title="Flash + Crush"
          description="Subtle flash, horizontal squeeze"
          animationType="flash"
        />

        <DemoBlock
          title="Strike-Through"
          description="Three clean lines, smooth fade"
          animationType="strikethrough"
        />

        <DemoBlock
          title="Implode"
          description="Spins and collapses to center"
          animationType="implode"
        />
      </div>

      <div
        style={{
          border: '3px solid #000',
          background: '#FAFAFA',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#666',
            margin: 0,
          }}
        >
          Click any "DELETE" button to preview the animation
        </p>
      </div>
    </div>
  );
}
