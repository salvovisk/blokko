'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Quote {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface QuotesTableProps {
  quotes: Quote[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortColumn = 'title' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const STATUS_COLORS: Record<string, { border: string; bg: string; color: string }> = {
  draft: { border: '#666', bg: '#F5F5F5', color: '#666' },
  sent: { border: '#2563EB', bg: '#EFF6FF', color: '#2563EB' },
  accepted: { border: '#059669', bg: '#ECFDF5', color: '#059669' },
  rejected: { border: '#DC2626', bg: '#FEF2F2', color: '#DC2626' },
};

export default function QuotesTable({ quotes, onEdit, onDelete }: QuotesTableProps) {
  const { t } = useLanguage();
  const [sortColumn, setSortColumn] = useState<SortColumn>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort quotes
  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortColumn === 'updatedAt') {
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
      } else {
        aVal = (a[sortColumn] || '').toString().toLowerCase();
        bVal = (b[sortColumn] || '').toString().toLowerCase();
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [quotes, sortColumn, sortDirection]);

  // Render sort arrow
  const renderSortArrow = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return (
      <span style={{ marginLeft: '8px' }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    const colors = STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.draft;
    return {
      display: 'inline-block',
      padding: '4px 12px',
      border: `2px solid ${colors.border}`,
      background: colors.bg,
      color: colors.color,
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    };
  };

  if (quotes.length === 0) {
    return (
      <div style={{ border: '3px dashed #CCC', padding: '60px', textAlign: 'center', background: '#FAFAFA' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>▦</div>
        <p style={{ fontSize: '16px', color: '#666' }}>
          {t.dashboard.quotes.emptyDescription}
        </p>
      </div>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedQuotes.map((quote) => (
          <div
            key={quote.id}
            style={{
              border: '3px solid #000',
              background: '#FFF',
              padding: '16px',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {quote.title}
              </div>
              {quote.description && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  {quote.description}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px' }}>
              <span style={getStatusStyle(quote.status)}>
                {quote.status}
              </span>
              <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {new Date(quote.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onEdit(quote.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#000',
                  border: '2px solid #000',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = '#333';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = '#000';
                }}
              >
                {t.dashboard.quotes.actions.edit}
              </button>
              <button
                onClick={() => onDelete(quote.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#FFF',
                  border: '2px solid #DC2626',
                  color: '#DC2626',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = '#DC2626';
                  e.currentTarget.style.color = '#FFF';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = '#FFF';
                  e.currentTarget.style.color = '#DC2626';
                }}
              >
                {t.dashboard.quotes.actions.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div style={{ border: '3px solid #000', background: '#FFF', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#000', color: '#FFF' }}>
            <th
              onClick={() => handleSort('title')}
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'sticky',
                top: 0,
                background: '#000',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
              }}
            >
              {t.dashboard.quotes.table.title} {renderSortArrow('title')}
            </th>
            <th
              onClick={() => handleSort('status')}
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'sticky',
                top: 0,
                background: '#000',
                width: '150px',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
              }}
            >
              {t.dashboard.quotes.table.status} {renderSortArrow('status')}
            </th>
            <th
              onClick={() => handleSort('updatedAt')}
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'sticky',
                top: 0,
                background: '#000',
                width: '180px',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
              }}
            >
              {t.dashboard.quotes.table.updated} {renderSortArrow('updatedAt')}
            </th>
            <th
              style={{
                padding: '16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                position: 'sticky',
                top: 0,
                background: '#000',
                width: '200px',
              }}
            >
              {t.dashboard.quotes.table.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedQuotes.map((quote) => (
            <tr
              key={quote.id}
              onMouseEnter={() => setHoveredRow(quote.id)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                background: hoveredRow === quote.id ? '#FAFAFA' : '#FFF',
                borderTop: '2px solid #EEE',
                transition: 'background 0.15s ease-in-out',
              }}
            >
              <td style={{ padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                  {quote.title}
                </div>
                {quote.description && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '400px',
                    }}
                  >
                    {quote.description}
                  </div>
                )}
              </td>
              <td style={{ padding: '16px' }}>
                <span style={getStatusStyle(quote.status)}>
                  {quote.status}
                </span>
              </td>
              <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                {new Date(quote.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td style={{ padding: '16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit(quote.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#FFF',
                      border: '2px solid #000',
                      color: '#000',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#000';
                      e.currentTarget.style.color = '#FFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFF';
                      e.currentTarget.style.color = '#000';
                    }}
                  >
                    {t.dashboard.quotes.actions.edit}
                  </button>
                  <button
                    onClick={() => onDelete(quote.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#FFF',
                      border: '2px solid #DC2626',
                      color: '#DC2626',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#DC2626';
                      e.currentTarget.style.color = '#FFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFF';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                  >
                    {t.dashboard.quotes.actions.delete}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
