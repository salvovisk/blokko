'use client';

import { useCallback } from 'react';
import type { TermsBlock as TermsBlockType, SaveState } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface TermsBlockProps {
  block: TermsBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function TermsBlock({ block, isActive }: TermsBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleTitleChange = useCallback(
    (value: string) => {
      updateBlockWithAutoSave(block.id, { title: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const handleTermChange = useCallback(
    (index: number, value: string) => {
      const updatedTerms = [...block.data.terms];
      updatedTerms[index] = value;
      updateBlockWithAutoSave(block.id, { terms: updatedTerms });
    },
    [block.id, block.data.terms, updateBlockWithAutoSave]
  );

  const addTerm = useCallback(() => {
    const updatedTerms = [...block.data.terms, 'New term'];
    updateBlockWithAutoSave(block.id, { terms: updatedTerms });
  }, [block.id, block.data.terms, updateBlockWithAutoSave]);

  const removeTerm = useCallback(
    (index: number) => {
      const updatedTerms = block.data.terms.filter((_, i) => i !== index);
      updateBlockWithAutoSave(block.id, { terms: updatedTerms });
    },
    [block.id, block.data.terms, updateBlockWithAutoSave]
  );

  const moveTerm = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === block.data.terms.length - 1)
      ) {
        return;
      }

      const updatedTerms = [...block.data.terms];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [updatedTerms[index], updatedTerms[newIndex]] = [updatedTerms[newIndex], updatedTerms[index]];
      updateBlockWithAutoSave(block.id, { terms: updatedTerms });
    },
    [block.id, block.data.terms, updateBlockWithAutoSave]
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
    marginBottom: '24px',
  };

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
    padding: '12px',
    border: '1px solid #000',
    backgroundColor: '#fff',
  };

  const bulletStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '4px',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    padding: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
    lineHeight: '1.6',
  };

  const buttonStyle: React.CSSProperties = {
    border: '2px solid #000',
    padding: '8px 16px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.1s ease',
  };

  const iconButtonStyle: React.CSSProperties = {
    border: '1px solid #000',
    padding: '4px 8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 'bold',
    flexShrink: 0,
  };

  const removeButtonStyle: React.CSSProperties = {
    ...iconButtonStyle,
    backgroundColor: '#000',
    color: '#fff',
  };

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
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
      <input
        type="text"
        value={block.data.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        style={titleInputStyle}
        placeholder="Terms & Conditions"
      />

      <ul style={listStyle}>
        {block.data.terms.map((term, index) => (
          <li key={index} style={listItemStyle}>
            <span style={bulletStyle}>•</span>
            <input
              type="text"
              value={term}
              onChange={(e) => handleTermChange(index, e.target.value)}
              style={inputStyle}
              placeholder="Enter term"
            />
            <div style={controlsStyle}>
              <button
                onClick={() => moveTerm(index, 'up')}
                style={iconButtonStyle}
                disabled={index === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => moveTerm(index, 'down')}
                style={iconButtonStyle}
                disabled={index === block.data.terms.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => removeTerm(index)}
                style={removeButtonStyle}
                title="Remove term"
              >
                X
              </button>
            </div>
          </li>
        ))}
      </ul>

      {block.data.terms.length === 0 && (
        <div style={{ padding: '32px', textAlign: 'center', color: '#666', border: '1px solid #ccc' }}>
          No terms yet. Click "Add Term" to start.
        </div>
      )}

      <button onClick={addTerm} style={{ ...buttonStyle, marginTop: '16px' }}>
        + Add Term
      </button>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', textAlign: 'right' }}>
        {block.data.terms.length} term{block.data.terms.length !== 1 ? 's' : ''}
      </div>
    </div>
    </>
  );
}
