'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { swissTheme } from '@/styles/swiss-theme';
import QuoteStatusSelect, { type QuoteStatus } from '@/components/ui/QuoteStatusSelect';

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
  onStatusChange: (id: string, status: QuoteStatus) => void;
}

type SortColumn = 'title' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const { colors } = swissTheme;

// Lifecycle order, so sorting by status reads draft → sent → accepted → rejected
const STATUS_ORDER: Record<string, number> = { draft: 0, sent: 1, accepted: 2, rejected: 3 };

const actionButton: React.CSSProperties = {
  padding: '8px 16px',
  minHeight: '36px',
  background: colors.white,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'background 0.15s ease, color 0.15s ease',
};

const editButton: React.CSSProperties = { ...actionButton, border: `2px solid ${colors.black}`, color: colors.black };
const deleteButton: React.CSSProperties = { ...actionButton, border: `2px solid ${colors.error}`, color: colors.error };

function invert(el: HTMLElement, fg: string) {
  el.style.background = fg;
  el.style.color = colors.white;
}

function restore(el: HTMLElement, fg: string) {
  el.style.background = colors.white;
  el.style.color = fg;
}

export default function QuotesTable({ quotes, onEdit, onDelete, onStatusChange }: QuotesTableProps) {
  const { t, locale } = useLanguage();
  const [sortColumn, setSortColumn] = useState<SortColumn>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortColumn === 'updatedAt') {
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
      } else if (sortColumn === 'status') {
        aVal = STATUS_ORDER[a.status.toLowerCase()] ?? 0;
        bVal = STATUS_ORDER[b.status.toLowerCase()] ?? 0;
      } else {
        aVal = (a.title || '').toLowerCase();
        bVal = (b.title || '').toLowerCase();
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [quotes, sortColumn, sortDirection]);

  const dateLocale = locale === 'it' ? 'it-IT' : 'en-US';

  const statusLabel = (title: string) => `${t.dashboard.quotes.table.status}: ${title}`;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedQuotes.map((quote) => (
          <div key={quote.id} style={{ border: `3px solid ${colors.black}`, background: colors.white, padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', overflowWrap: 'anywhere' }}>
                {quote.title}
              </div>
              {quote.description && (
                <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '12px' }}>{quote.description}</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px' }}>
              <QuoteStatusSelect
                value={quote.status}
                onChange={(s) => onStatusChange(quote.id, s)}
                label={statusLabel(quote.title)}
              />
              <span style={{ color: colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em', fontVariantNumeric: 'tabular-nums' }}>
                {new Date(quote.updatedAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onEdit(quote.id)}
                style={{ ...editButton, flex: 1, minHeight: '44px', background: colors.black, color: colors.white }}
              >
                {t.dashboard.quotes.actions.edit}
              </button>
              <button type="button" onClick={() => onDelete(quote.id)} style={{ ...deleteButton, flex: 1, minHeight: '44px' }}>
                {t.dashboard.quotes.actions.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderSortHeader = (column: SortColumn, label: string, width?: string) => {
    const active = sortColumn === column;
    return (
      <th
        key={column}
        aria-sort={active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        style={{ position: 'sticky', top: 0, background: colors.black, width, padding: 0, textAlign: 'left' }}
      >
        <button
          type="button"
          onClick={() => handleSort(column)}
          style={{
            width: '100%',
            padding: '16px',
            background: 'transparent',
            border: 'none',
            color: colors.white,
            textAlign: 'left',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#333333')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {label}
          <span aria-hidden="true" style={{ marginLeft: '8px', opacity: active ? 1 : 0 }}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div style={{ border: `3px solid ${colors.black}`, background: colors.white, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: colors.black, color: colors.white }}>
            {renderSortHeader('title', t.dashboard.quotes.table.title)}
            {renderSortHeader('status', t.dashboard.quotes.table.status, '170px')}
            {renderSortHeader('updatedAt', t.dashboard.quotes.table.updated, '180px')}
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
                background: colors.black,
                width: '200px',
              }}
            >
              {t.dashboard.quotes.table.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedQuotes.map((quote) => (
            <tr key={quote.id} className="quotes-row" style={{ borderTop: `1px solid ${colors.lightGray}` }}>
              <td style={{ padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{quote.title}</div>
                {quote.description && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: colors.gray,
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
                <QuoteStatusSelect
                  value={quote.status}
                  onChange={(s) => onStatusChange(quote.id, s)}
                  label={statusLabel(quote.title)}
                />
              </td>
              <td style={{ padding: '16px', fontSize: '14px', color: colors.gray, fontVariantNumeric: 'tabular-nums' }}>
                {new Date(quote.updatedAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' })}
              </td>
              <td style={{ padding: '16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => onEdit(quote.id)}
                    style={editButton}
                    onMouseEnter={(e) => invert(e.currentTarget, colors.black)}
                    onMouseLeave={(e) => restore(e.currentTarget, colors.black)}
                  >
                    {t.dashboard.quotes.actions.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(quote.id)}
                    style={deleteButton}
                    onMouseEnter={(e) => invert(e.currentTarget, colors.error)}
                    onMouseLeave={(e) => restore(e.currentTarget, colors.error)}
                  >
                    {t.dashboard.quotes.actions.delete}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        .quotes-row:hover {
          background: ${colors.veryLightGray};
        }
      `}</style>
    </div>
  );
}
