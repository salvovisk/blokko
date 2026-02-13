'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuotesTable from '@/components/tables/QuotesTable';

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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuotes(quotes.filter((q) => q.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete quote:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          LOADING QUOTES...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', justifyContent: 'space-between', alignItems: window.innerWidth < 768 ? 'stretch' : 'center', gap: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
          MY QUOTES
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
          + NEW QUOTE
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div style={{ border: '3px dashed #CCC', padding: '60px', textAlign: 'center', background: '#FFF' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>▦</div>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            You haven't created any quotes yet.
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
            CREATE YOUR FIRST QUOTE
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
