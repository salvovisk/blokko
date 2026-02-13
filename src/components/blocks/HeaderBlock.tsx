'use client';

import { useCallback } from 'react';
import type { HeaderBlock as HeaderBlockType, SaveState } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface HeaderBlockProps {
  block: HeaderBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function HeaderBlock({ block, isActive }: HeaderBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof HeaderBlockType['data'], value: string) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    border: isActive ? '4px solid #000' : '2px solid #000',
    padding: '32px',
    backgroundColor: isActive ? '#f5f5f5' : '#fff',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    borderLeft: accentColor !== 'transparent' ? `4px solid ${accentColor}` : isActive ? '4px solid #000' : '2px solid #000',
    animation: saveState === 'error' ? 'shake 0.3s' : saveState === 'saved' ? 'flash 0.5s' : 'none',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginTop: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '4px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #000',
    padding: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '16px',
    borderBottom: '2px solid #000',
    paddingBottom: '8px',
  };

  return (
    <>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
      <div style={containerStyle}>
      <div style={titleStyle}>QUOTE HEADER</div>

      <div style={gridStyle}>
        {/* Company Info */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Company Name *</label>
            <input
              type="text"
              value={block.data.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              style={inputStyle}
              placeholder="Your Company"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Company Address</label>
            <input
              type="text"
              value={block.data.companyAddress || ''}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              style={inputStyle}
              placeholder="123 Business St, City"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Company Email</label>
            <input
              type="email"
              value={block.data.companyEmail || ''}
              onChange={(e) => handleChange('companyEmail', e.target.value)}
              style={inputStyle}
              placeholder="info@company.com"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Company Phone</label>
            <input
              type="tel"
              value={block.data.companyPhone || ''}
              onChange={(e) => handleChange('companyPhone', e.target.value)}
              style={inputStyle}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        {/* Client Info */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Client Name *</label>
            <input
              type="text"
              value={block.data.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              style={inputStyle}
              placeholder="Client Name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Client Address</label>
            <input
              type="text"
              value={block.data.clientAddress || ''}
              onChange={(e) => handleChange('clientAddress', e.target.value)}
              style={inputStyle}
              placeholder="456 Client Ave, City"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Client Email</label>
            <input
              type="email"
              value={block.data.clientEmail || ''}
              onChange={(e) => handleChange('clientEmail', e.target.value)}
              style={inputStyle}
              placeholder="client@email.com"
            />
          </div>
        </div>
      </div>

      {/* Quote Details */}
      <div style={{ ...gridStyle, marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #000' }}>
        <div>
          <label style={labelStyle}>Quote Number *</label>
          <input
            type="text"
            value={block.data.quoteNumber}
            onChange={(e) => handleChange('quoteNumber', e.target.value)}
            style={inputStyle}
            placeholder="Q-12345"
          />
        </div>

        <div>
          <label style={labelStyle}>Date *</label>
          <input
            type="date"
            value={block.data.date}
            onChange={(e) => handleChange('date', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Valid Until</label>
          <input
            type="date"
            value={block.data.validUntil || ''}
            onChange={(e) => handleChange('validUntil', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
    </>
  );
}
