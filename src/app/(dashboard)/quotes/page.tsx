'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuotesTable from '@/components/tables/QuotesTable';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCsrf, withCsrf } from '@/hooks/useCsrf';
import { QuotesIcon } from '@/components/icons/GeometricIcons';
import type { QuoteStatus } from '@/components/ui/QuoteStatusSelect';

interface Quote {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const UNDO_WINDOW_MS = 6000;

export default function QuotesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { token: csrfToken } = useCsrf();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      if (!res.ok) {
        throw new Error('Failed to fetch quotes');
      }
      const result = await res.json();
      // Handle new paginated response format
      const data = result.data || result;
      setQuotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      showToast(t.messages.quotesLoadFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Deletes are deferred behind an Undo toast. The DELETE request only fires
  // once the undo window closes, or immediately if the user leaves the page.
  const pendingDelete = useRef<{ quote: Quote; index: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const csrfRef = useRef(csrfToken);
  csrfRef.current = csrfToken;

  const commitDelete = async (quote: Quote, index: number, keepalive = false) => {
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, withCsrf(csrfRef.current, { method: 'DELETE', keepalive }));
      if (!res.ok) throw new Error('Failed to delete quote');
    } catch (error) {
      console.error('Failed to delete quote:', error);
      if (keepalive) return;
      setQuotes((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, quote);
        return next;
      });
      showToast(t.messages.quoteDeleteFailed, 'error');
    }
  };

  const flushPendingDelete = (keepalive = false) => {
    const pending = pendingDelete.current;
    if (!pending) return;
    clearTimeout(pending.timer);
    pendingDelete.current = null;
    commitDelete(pending.quote, pending.index, keepalive);
  };

  useEffect(() => () => flushPendingDelete(true), []); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteQuote = (id: string) => {
    const index = quotes.findIndex((q) => q.id === id);
    if (index === -1) return;
    const quote = quotes[index];

    flushPendingDelete();
    setQuotes((prev) => prev.filter((q) => q.id !== id));

    const timer = setTimeout(() => flushPendingDelete(), UNDO_WINDOW_MS);
    pendingDelete.current = { quote, index, timer };

    showToast(t.messages.quoteDeleted.replace('{title}', quote.title), 'info', {
      label: t.common.undo,
      onClick: () => {
        const pending = pendingDelete.current;
        if (!pending || pending.quote.id !== id) return;
        clearTimeout(pending.timer);
        pendingDelete.current = null;
        setQuotes((prev) => {
          const next = [...prev];
          next.splice(Math.min(pending.index, next.length), 0, pending.quote);
          return next;
        });
      },
    });
  };

  const changeStatus = async (id: string, status: QuoteStatus) => {
    const previous = quotes.find((q) => q.id === id)?.status;
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    try {
      const res = await fetch(
        `/api/quotes/${id}`,
        withCsrf(csrfToken, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      );
      if (!res.ok) throw new Error('Failed to update status');
    } catch (error) {
      console.error('Failed to update status:', error);
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status: previous ?? q.status } : q)));
      showToast(t.messages.statusUpdateFailed, 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
            {t.dashboard.quotes.title}
          </h1>
          <div style={{ height: '44px', width: '140px', background: '#F0F0F0', border: '3px solid #CCCCCC' }} />
        </div>
        <LoadingSkeleton type="table" rows={5} />
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} action={toast.action} onClose={hideToast} />}


      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
          {t.dashboard.quotes.title}
        </h1>
        <Link
          href="/builder?new=1"
          style={{
            padding: 'clamp(12px, 3vw, 16px) clamp(24px, 5vw, 32px)',
            background: '#000',
            color: '#FFF',
            fontSize: 'clamp(11px, 2.5vw, 12px)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '3px solid #000',
            display: 'inline-block',
            textAlign: 'center',
            transition: 'all 0.2s ease-in-out',
            minHeight: '44px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFF';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000';
            e.currentTarget.style.color = '#FFF';
          }}
        >
          {t.dashboard.quotes.newQuote}
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div style={{ border: '3px dashed #CCC', padding: '60px', textAlign: 'center', background: '#FFF' }}>
          <div aria-hidden="true" style={{ fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><QuotesIcon /></div>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            {t.dashboard.quotes.emptyDescription}
          </p>
          <Link
            href="/builder?new=1"
            style={{
              padding: '16px 32px',
              background: '#000',
              color: '#FFF',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFF';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000';
              e.currentTarget.style.color = '#FFF';
            }}
          >
            {t.dashboard.quotes.emptyAction}
          </Link>
        </div>
      ) : (
        <QuotesTable
          quotes={quotes}
          onEdit={(id) => router.push(`/builder?id=${id}`)}
          onDelete={deleteQuote}
          onStatusChange={changeStatus}
        />
      )}
    </div>
  );
}
