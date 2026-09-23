'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { swissTheme } from '@/styles/swiss-theme';

export const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'rejected'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

const { colors } = swissTheme;

// Status is carried by fill and line, not hue:
// draft = dashed gray, sent = black outline, accepted = solid black, rejected = the one red.
const STATUS_STYLE: Record<QuoteStatus, React.CSSProperties> = {
  draft: { border: `2px dashed ${colors.gray}`, backgroundColor: colors.white, color: colors.gray },
  sent: { border: `2px solid ${colors.black}`, backgroundColor: colors.white, color: colors.black },
  accepted: { border: `2px solid ${colors.black}`, backgroundColor: colors.black, color: colors.white },
  rejected: { border: `2px solid ${colors.error}`, backgroundColor: colors.white, color: colors.error },
};

export function normalizeStatus(status: string): QuoteStatus {
  const s = status.toLowerCase();
  return (QUOTE_STATUSES as readonly string[]).includes(s) ? (s as QuoteStatus) : 'draft';
}

export function statusStyle(status: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    ...STATUS_STYLE[normalizeStatus(status)],
  };
}

interface QuoteStatusSelectProps {
  value: string;
  onChange: (status: QuoteStatus) => void;
  disabled?: boolean;
  /** Accessible name, e.g. "Status of Website redesign" */
  label?: string;
}

/**
 * Native select dressed as a status badge: keyboard and screen-reader
 * friendly for free, and reads as the badge it replaces.
 */
export default function QuoteStatusSelect({ value, onChange, disabled, label }: QuoteStatusSelectProps) {
  const { t } = useLanguage();
  const status = normalizeStatus(value);
  const labels = t.dashboard.quotes.status as Record<string, string>;

  return (
    <select
      value={status}
      disabled={disabled}
      aria-label={label ?? t.dashboard.quotes.table.status}
      onChange={(e) => onChange(e.target.value as QuoteStatus)}
      style={{
        ...statusStyle(status),
        appearance: 'none',
        WebkitAppearance: 'none',
        borderRadius: 0,
        padding: '6px 28px 6px 12px',
        minHeight: '32px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        backgroundImage: `linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)`,
        backgroundPosition: 'calc(100% - 14px) 50%, calc(100% - 9px) 50%',
        backgroundSize: '5px 5px, 5px 5px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {QUOTE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {labels[s]}
        </option>
      ))}
    </select>
  );
}
