'use client';

import { useCallback } from 'react';
import type { TextBlock as TextBlockType } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';
import { blockFrameBorder } from './blockFrame';

interface TextBlockProps {
  block: TextBlockType;
  isActive: boolean;
}


export default function TextBlock({ block, isActive }: TextBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';

  const handleChange = useCallback(
    (field: keyof TextBlockType['data'], value: string) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    border: blockFrameBorder(saveState, isActive),
    padding: '32px',
    backgroundColor: isActive ? '#f5f5f5' : '#fff',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    animation: saveState === 'error' ? 'shake 0.3s' : saveState === 'saved' ? 'flash 0.5s' : 'none',
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

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '150px',
    border: '1px solid #000',
    padding: '16px',
    fontSize: '14px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    backgroundColor: '#fff',
    resize: 'vertical',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block',
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
      <div className="quote-block" style={containerStyle}>
        <div>
          <label style={labelStyle}>Title (Optional)</label>
          <input
            type="text"
            value={block.data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            style={titleInputStyle}
            placeholder="Optional Section Title"
          />
        </div>

        <div>
          <label style={labelStyle}>Content</label>
          <textarea
            value={block.data.content}
            onChange={(e) => handleChange('content', e.target.value)}
            style={textareaStyle}
            placeholder="Enter your text here..."
          />
        </div>

        <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', textAlign: 'right' }}>
          {block.data.content.length} characters
        </div>
      </div>
    </>
  );
}
