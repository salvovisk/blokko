'use client';

interface LoadingSkeletonProps {
  type?: 'table' | 'cards' | 'form';
  rows?: number;
}

export default function LoadingSkeleton({ type = 'cards', rows = 3 }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div style={{ border: '3px solid #000', background: '#FFF', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ background: '#000', padding: '16px', display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, height: '16px', background: '#333' }} />
          <div style={{ width: '150px', height: '16px', background: '#333' }} />
          <div style={{ width: '180px', height: '16px', background: '#333' }} />
          <div style={{ width: '200px', height: '16px', background: '#333' }} />
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              borderTop: '2px solid #EEE',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ height: '16px', width: '60%', background: '#E5E7EB', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '40%', background: '#F3F4F6' }} />
            </div>
            <div style={{ width: '150px' }}>
              <div style={{ height: '24px', width: '80px', background: '#F3F4F6' }} />
            </div>
            <div style={{ width: '180px' }}>
              <div style={{ height: '14px', width: '100px', background: '#E5E7EB' }} />
            </div>
            <div style={{ width: '200px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <div style={{ height: '32px', width: '60px', background: '#F3F4F6', border: '2px solid #E5E7EB' }} />
              <div style={{ height: '32px', width: '70px', background: '#F3F4F6', border: '2px solid #E5E7EB' }} />
            </div>
          </div>
        ))}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            style={{
              border: '3px solid #000',
              background: '#FFF',
              padding: '20px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ height: '20px', width: '70%', background: '#E5E7EB', marginBottom: '12px' }} />
              <div style={{ height: '14px', width: '50%', background: '#F3F4F6' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ height: '24px', width: '80px', background: '#F3F4F6' }} />
              <div style={{ height: '14px', width: '100px', background: '#E5E7EB' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, height: '40px', background: '#F3F4F6', border: '2px solid #E5E7EB' }} />
              <div style={{ flex: 1, height: '40px', background: '#F3F4F6', border: '2px solid #E5E7EB' }} />
            </div>
          </div>
        ))}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // Form skeleton
  return (
    <div style={{ border: '3px solid #000', background: '#FFF', padding: '32px' }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div style={{ height: '12px', width: '120px', background: '#E5E7EB', marginBottom: '8px' }} />
          <div style={{ height: '44px', width: '100%', background: '#F3F4F6', border: '3px solid #E5E7EB' }} />
        </div>
      ))}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
