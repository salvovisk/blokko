'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuotesTable from '@/components/tables/QuotesTable';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Quote {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuotesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
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
      const data = await res.json();
      setQuotes(data);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      showToast(t.messages.quotesLoadFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;

    setDeleteConfirm({ id, title: quote.title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const res = await fetch(`/api/quotes/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete quote');
      }
      setQuotes(quotes.filter((q) => q.id !== deleteConfirm.id));
      showToast(t.messages.quoteDeleted, 'success');
    } catch (error) {
      console.error('Failed to delete quote:', error);
      showToast(t.messages.quoteDeleteFailed, 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
            {t.dashboard.quotes.title}
          </h1>
          <div style={{ height: '44px', width: '140px', background: '#E5E7EB', border: '3px solid #000' }} />
        </div>
        <LoadingSkeleton type="table" rows={5} />
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {deleteConfirm && (
        <ConfirmDialog
          title={t.confirmDialog.deleteQuote.title}
          message={t.confirmDialog.deleteQuote.message.replace('{title}', deleteConfirm.title)}
          confirmText={t.confirmDialog.deleteQuote.confirm}
          cancelText={t.confirmDialog.deleteQuote.cancel}
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', justifyContent: 'space-between', alignItems: window.innerWidth < 768 ? 'stretch' : 'center', gap: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
          {t.dashboard.quotes.title}
        </h1>
        <Link
          href="/builder"
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>▦</div>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            {t.dashboard.quotes.emptyDescription}
          </p>
          <Link
            href="/builder"
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
        />
      )}
    </div>
  );
}
