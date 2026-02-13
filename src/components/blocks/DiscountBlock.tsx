'use client';

import { useCallback } from 'react';
import type { DiscountBlock as DiscountBlockType, SaveState } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface DiscountBlockProps {
  block: DiscountBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function DiscountBlock({ block, isActive }: DiscountBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof DiscountBlockType['data'], value: any) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const addCondition = () => {
    handleChange('conditions', [...block.data.conditions, '']);
  };

  const removeCondition = (index: number) => {
    handleChange('conditions', block.data.conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...block.data.conditions];
    newConditions[index] = value;
    handleChange('conditions', newConditions);
  };

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

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: '2px solid #000',
    backgroundColor: '#fff',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Offer Title</label>
        <input type="text" value={block.data.title} onChange={(e) => handleChange('title', e.target.value)} style={titleInputStyle} placeholder="Special Offer" />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Offer Type</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['percentage', 'fixed', 'package'].map((type) => (
            <button
              key={type}
              onClick={() => handleChange('offerType', type)}
              style={{
                ...buttonStyle,
                backgroundColor: block.data.offerType === type ? '#000' : '#fff',
                color: block.data.offerType === type ? '#fff' : '#000',
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Discount Value</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            value={block.data.discountValue}
            onChange={(e) => handleChange('discountValue', parseFloat(e.target.value) || 0)}
            style={{ ...inputStyle, width: '150px' }}
            placeholder="10"
          />
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{block.data.offerType === 'percentage' ? '%' : '$'}</span>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Description</label>
        <textarea value={block.data.description} onChange={(e) => handleChange('description', e.target.value)} style={textareaStyle} placeholder="Book before Dec 31st..." />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Valid Until (Optional)</label>
        <input type="text" value={block.data.validUntil || ''} onChange={(e) => handleChange('validUntil', e.target.value)} style={inputStyle} placeholder="YYYY-MM-DD" />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Conditions</label>
        {block.data.conditions.map((condition, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input type="text" value={condition} onChange={(e) => updateCondition(index, e.target.value)} style={inputStyle} placeholder="Condition..." />
            <button onClick={() => removeCondition(index)} style={{ ...buttonStyle, backgroundColor: '#000', color: '#fff', padding: '8px 12px' }}>
              ×
            </button>
          </div>
        ))}
        <button onClick={addCondition} style={buttonStyle}>
          + Add Condition
        </button>
      </div>
    </div>
  );
}
