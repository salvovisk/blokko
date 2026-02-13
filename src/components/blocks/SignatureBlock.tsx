'use client';

import { useCallback } from 'react';
import type { SignatureBlock as SignatureBlockType, SaveState } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface SignatureBlockProps {
  block: SignatureBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function SignatureBlock({ block, isActive }: SignatureBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof SignatureBlockType['data'], value: any) => {
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
  };

  const titleInputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #000',
    padding: '8px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #000',
    padding: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '80px',
    border: '1px solid #000',
    padding: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    backgroundColor: '#fff',
    resize: 'vertical',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Section Title</label>
        <input type="text" value={block.data.title} onChange={(e) => handleChange('title', e.target.value)} style={titleInputStyle} placeholder="Client Approval" />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Approval Text</label>
        <textarea value={block.data.approvalText} onChange={(e) => handleChange('approvalText', e.target.value)} style={textareaStyle} placeholder="By signing below, you accept..." />
      </div>

      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Signature Label</label>
          <input type="text" value={block.data.signatureLabel} onChange={(e) => handleChange('signatureLabel', e.target.value)} style={inputStyle} placeholder="Client Signature" />
        </div>
        <div>
          <label style={labelStyle}>Date Label</label>
          <input type="text" value={block.data.dateLabel} onChange={(e) => handleChange('dateLabel', e.target.value)} style={inputStyle} placeholder="Date" />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={block.data.showCompanySignature} onChange={(e) => handleChange('showCompanySignature', e.target.checked)} style={{ marginRight: '8px' }} />
          <span style={{ ...labelStyle, marginBottom: 0 }}>Show Company Signature Section</span>
        </label>
      </div>

      <div style={{ padding: '24px', border: '2px dashed #666', backgroundColor: '#fafafa' }}>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', lineHeight: '1.6', margin: '0 0 16px 0' }}>{block.data.approvalText}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: block.data.showCompanySignature ? '1fr 1fr' : '1fr', gap: '32px' }}>
          <div>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '8px', paddingBottom: '32px' }}></div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{block.data.signatureLabel}</div>
          </div>

          {block.data.showCompanySignature && (
            <div>
              <div style={{ borderBottom: '2px solid #000', marginBottom: '8px', paddingBottom: '32px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>COMPANY SIGNATURE</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: block.data.showCompanySignature ? '1fr 1fr' : '1fr', gap: '32px' }}>
          <div>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '8px', paddingBottom: '16px' }}></div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{block.data.dateLabel}</div>
          </div>

          {block.data.showCompanySignature && (
            <div>
              <div style={{ borderBottom: '2px solid #000', marginBottom: '8px', paddingBottom: '16px' }}></div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>DATE</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
