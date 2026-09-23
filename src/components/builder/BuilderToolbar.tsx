'use client';

import { useBuilderStore } from '@/stores/builder-store';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModifierKey } from '@/hooks/useModifierKey';
import QuoteStatusSelect, { type QuoteStatus } from '@/components/ui/QuoteStatusSelect';

interface BuilderToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  onExportPDF?: () => void;
  onClear?: () => void;
  onSaveAsTemplate?: () => void;
  isSaving?: boolean;
  isExporting?: boolean;
  /** Only shown once the quote exists on the server */
  quoteStatus?: string | null;
  onStatusChange?: (status: QuoteStatus) => void;
}

export default function BuilderToolbar({
  onSave,
  onPreview,
  onExportPDF,
  onClear,
  onSaveAsTemplate,
  isSaving = false,
  isExporting = false,
  quoteStatus,
  onStatusChange,
}: BuilderToolbarProps) {
  const { t } = useLanguage();
  const mod = useModifierKey();
  const { quoteTitle, setQuoteTitle, clearBuilder } = useBuilderStore();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // No confirm dialog: clearing is undoable from the toast the page shows.
  const handleClear = () => {
    clearBuilder();
    onClear?.();
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '16px',
          padding: isMobile ? '12px 16px' : '16px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '3px solid #000000',
          minHeight: isMobile ? 'auto' : '72px',
        }}
      >
      {/* Title Input */}
      <input
        type="text"
        value={quoteTitle}
        onChange={(e) => setQuoteTitle(e.target.value)}
        aria-label={t.builder.toolbar.titlePlaceholder}
        style={{
          flex: isMobile ? 'none' : 1,
          fontSize: isMobile ? '14px' : '18px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          padding: isMobile ? '12px' : '8px 12px',
          border: '2px solid #000000',
          backgroundColor: '#FFFFFF',
          letterSpacing: '0.5px',
          minHeight: isMobile ? '44px' : 'auto',
        }}
        placeholder={t.builder.toolbar.titlePlaceholder}
      />

      {quoteStatus && onStatusChange && (
        <QuoteStatusSelect
          value={quoteStatus}
          onChange={onStatusChange}
          label={t.builder.toolbar.status}
        />
      )}

      {/* Buttons Container */}
      <div
        style={{
          display: 'flex',
          gap: isMobile ? '8px' : '16px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}
      >
        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
            padding: isMobile ? '12px 16px' : '10px 20px',
            fontSize: isMobile ? '11px' : '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            backgroundColor: isSaving ? '#666666' : '#000000',
            color: '#FFFFFF',
            border: '2px solid #000000',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            opacity: isSaving ? 0.7 : 1,
            minHeight: isMobile ? '44px' : 'auto',
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#000000';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = '#FFFFFF';
            }
          }}
        >
          {isSaving ? t.builder.toolbar.saving : isMobile ? t.builder.toolbar.save : t.builder.toolbar.saveShortcut.replace('{key}', mod)}
        </button>

        {/* Preview Button */}
        <button
          onClick={onPreview}
          style={{
            flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
            padding: isMobile ? '12px 16px' : '10px 20px',
            fontSize: isMobile ? '11px' : '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            minHeight: isMobile ? '44px' : 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = '#000000';
          }}
        >
          {isMobile ? t.builder.toolbar.previewMobile : t.builder.toolbar.preview}
        </button>

        {/* Export PDF Button */}
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          style={{
            flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
            padding: isMobile ? '12px 16px' : '10px 20px',
            fontSize: isMobile ? '11px' : '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            opacity: isExporting ? 0.7 : 1,
            minHeight: isMobile ? '44px' : 'auto',
          }}
          onMouseEnter={(e) => {
            if (!isExporting) {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.color = '#FFFFFF';
            }
          }}
          onMouseLeave={(e) => {
            if (!isExporting) {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#000000';
            }
          }}
        >
          {isExporting ? t.builder.toolbar.exporting : (isMobile ? t.builder.toolbar.exportPdfMobile : t.builder.toolbar.exportPdf)}
        </button>

        {/* Save as Template Button */}
        <button
          onClick={onSaveAsTemplate}
          style={{
            flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
            padding: isMobile ? '12px 16px' : '10px 20px',
            fontSize: isMobile ? '11px' : '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            minHeight: isMobile ? '44px' : 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = '#000000';
          }}
        >
          {isMobile ? t.builder.toolbar.saveTemplateMobile : t.builder.toolbar.saveTemplate}
        </button>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          style={{
            flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
            padding: isMobile ? '12px 16px' : '10px 20px',
            fontSize: isMobile ? '11px' : '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            backgroundColor: '#FFFFFF',
            color: '#D00000',
            border: '2px solid #D00000',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
            minHeight: isMobile ? '44px' : 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#D00000';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = '#D00000';
          }}
        >
          {t.builder.toolbar.clear}
        </button>
      </div>
      </div>
    </>
  );
}
