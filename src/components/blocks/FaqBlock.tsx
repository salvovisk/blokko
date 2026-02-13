'use client';

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { FaqBlock as FaqBlockType, SaveState, FaqItem } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface FaqBlockProps {
  block: FaqBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function FaqBlock({ block, isActive }: FaqBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof FaqBlockType['data'], value: any) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const addFaq = () => {
    const newFaq: FaqItem = {
      id: nanoid(),
      question: '',
      answer: '',
    };
    handleChange('faqs', [...block.data.faqs, newFaq]);
  };

  const removeFaq = (id: string) => {
    handleChange('faqs', block.data.faqs.filter((faq) => faq.id !== id));
  };

  const updateFaq = (id: string, field: keyof FaqItem, value: string) => {
    handleChange(
      'faqs',
      block.data.faqs.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq))
    );
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    border: isActive ? '4px solid #000' : '2px solid #000',
    padding: '32px',
    backgroundColor: isActive ? '#f5f5f5' : '#fff',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    borderLeft:
      accentColor !== 'transparent'
        ? `4px solid ${accentColor}`
        : isActive
        ? '4px solid #000'
        : '2px solid #000',
    animation:
      saveState === 'error'
        ? 'shake 0.3s'
        : saveState === 'saved'
        ? 'flash 0.5s'
        : 'none',
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

  const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#000',
    color: '#fff',
    padding: '4px 12px',
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
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Block Title</label>
          <input
            type="text"
            value={block.data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            style={titleInputStyle}
            placeholder="Frequently Asked Questions"
          />
        </div>

        {/* Numbering Toggle */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={block.data.showNumbering}
              onChange={(e) => handleChange('showNumbering', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ ...labelStyle, marginBottom: 0 }}>
              Show Question Numbering
            </span>
          </label>
        </div>

        {/* FAQ Items */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>FAQ Items</label>
          {block.data.faqs.map((faq, index) => (
            <div
              key={faq.id}
              style={{
                padding: '16px',
                marginBottom: '12px',
                border: '2px solid #000',
                backgroundColor: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>
                  {block.data.showNumbering ? `Q${index + 1}` : `Question ${index + 1}`}
                </span>
                <button
                  onClick={() => removeFaq(faq.id)}
                  style={deleteButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000';
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                  style={inputStyle}
                  placeholder="What's your question?"
                />
              </div>

              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Answer</label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                  style={textareaStyle}
                  placeholder="Your answer here..."
                />
              </div>
            </div>
          ))}

          <button
            onClick={addFaq}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            + Add FAQ
          </button>
        </div>

        <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', textAlign: 'right' }}>
          {block.data.faqs.length} FAQ{block.data.faqs.length !== 1 ? 's' : ''}
        </div>
      </div>
    </>
  );
}
