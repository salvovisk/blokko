'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => Promise<void>;
}

export default function SaveTemplateModal({ open, onClose, onSave }: SaveTemplateModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t.builder.saveTemplateModal.errorRequired);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(name.trim(), description.trim() || undefined);
      // Reset form
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.builder.saveTemplateModal.errorFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '3px solid #000000',
          maxWidth: '500px',
          width: '100%',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            borderBottom: '3px solid #000000',
            paddingBottom: '12px',
          }}
        >
          {t.builder.saveTemplateModal.title}
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            {t.builder.saveTemplateModal.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.builder.saveTemplateModal.namePlaceholder}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '3px solid #000000',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: loading ? '#F5F5F5' : '#FFFFFF',
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            {t.builder.saveTemplateModal.descriptionLabel}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.builder.saveTemplateModal.descriptionPlaceholder}
            disabled={loading}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '3px solid #000000',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              background: loading ? '#F5F5F5' : '#FFFFFF',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              border: '3px solid #DC2626',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: '3px solid #000000',
              background: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#F5F5F5';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            {t.builder.saveTemplateModal.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: '3px solid #10B981',
              background: loading ? '#F5F5F5' : '#10B981',
              color: loading ? '#666' : '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#10B981';
              }
            }}
          >
            {loading ? t.builder.saveTemplateModal.saving : t.builder.saveTemplateModal.save}
          </button>
        </div>
      </div>
    </div>
  );
}
