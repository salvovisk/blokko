'use client';

import { useDraggable } from '@dnd-kit/core';
import type { BlockType } from '@/types/blocks';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/stores/builder-store';
import { Tooltip } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';
import { CloseIcon } from '@/components/icons/GeometricIcons';

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface DraggableBlockProps {
  type: BlockType;
  label: string;
  description: string;
  isMobile?: boolean;
  onAdd: (type: BlockType) => void;
}

function DraggableBlock({ type, label, description, isMobile, onAdd }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${type}`,
    data: {
      type,
      isNew: true,
    },
    disabled: isMobile, // Disable drag on mobile
  });

  // Click (or Enter/Space) appends the block; dragging places it precisely.
  // The mouse sensor needs 10px of movement, so a plain click never starts a drag.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAdd(type);
    }
  };

  return (
    <Tooltip title={description} placement="right" arrow enterDelay={400} disableInteractive>
      <div
        ref={!isMobile ? setNodeRef : undefined}
        {...(!isMobile ? listeners : {})}
        {...(!isMobile ? attributes : {})}
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${description}`}
        onClick={() => onAdd(type)}
        onKeyDown={handleKeyDown}
        className="sidebar-block"
        data-dragging={isDragging || undefined}
        style={{
          padding: isMobile ? '0 16px' : '0 14px',
          minHeight: isMobile ? '52px' : '44px',
          marginBottom: '6px',
          backgroundColor: isDragging ? '#000000' : '#FFFFFF',
          color: isDragging ? '#FFFFFF' : '#000000',
          border: '2px solid #000000',
          cursor: isMobile ? 'pointer' : isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          opacity: isDragging ? 0.4 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          transition: 'background-color 0.12s ease, color 0.12s ease',
        }}
      >
        <span>{label}</span>
        <span aria-hidden="true" className="sidebar-block-plus" style={{ fontSize: '11px', display: 'flex' }}>
          <PlusIcon />
        </span>
      </div>
    </Tooltip>
  );
}

const PlusIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <rect x="13" y="4" width="6" height="24" />
    <rect x="4" y="13" width="24" height="6" />
  </svg>
);

// Grouped by where the block sits in a quote, so the library reads top to bottom
const BLOCK_GROUPS: Array<{ key: 'structure' | 'money' | 'closing'; types: BlockType[] }> = [
  { key: 'structure', types: ['HEADER', 'TEXT', 'TABLE', 'TIMELINE'] },
  { key: 'money', types: ['PRICES', 'DISCOUNT', 'PAYMENT'] },
  { key: 'closing', types: ['TERMS', 'FAQ', 'CONTACT', 'SIGNATURE'] },
];

export default function BuilderSidebar() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { addBlock } = useBuilderStore();

  const blockCopy = t.builder.sidebar.blocks as Record<string, { label: string; description: string }>;
  const groupLabels = t.builder.sidebar.groups;

  const handleAdd = (blockType: BlockType) => {
    addBlock(blockType);
    if (isMobile) setIsOpen(false); // Close sheet after adding
  };

  // Close on mobile when clicking outside
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  return (
    <>
      {/* Mobile: Floating Button to Open Sidebar */}
      {isMobile && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t.builder.sidebar.title}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999,
            width: '56px',
            height: '56px',
            background: '#000',
            border: '3px solid #000',
            color: '#FFF',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlusIcon />
        </button>
      )}

      {/* Mobile: Backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        />
      )}

      <div
        style={{
          width: isMobile ? '100%' : '300px',
          height: isMobile ? 'auto' : '100%',
          maxHeight: isMobile ? '70vh' : '100%',
          backgroundColor: '#FAFAFA',
          borderRight: isMobile ? 'none' : '3px solid #000000',
          borderTop: isMobile ? '3px solid #000000' : 'none',
          padding: isMobile ? '20px' : '24px',
          overflowY: 'auto',
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          left: isMobile ? 0 : 'auto',
          right: isMobile ? 0 : 'auto',
          zIndex: isMobile ? 999 : 'auto',
          transform: isMobile ? (isOpen ? 'translateY(0)' : 'translateY(100%)') : 'none',
          transition: isMobile ? 'transform 0.3s ease-in-out' : 'none',
        }}
      >
      {/* Sidebar Header */}
      <div
        style={{
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0,
            }}
          >
            {t.builder.sidebar.title}
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: '#666666',
              margin: '8px 0 0 0',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            {isMobile ? t.builder.sidebar.tapInstruction : t.builder.sidebar.dragInstruction}
          </p>
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={t.common.close}
            style={{
              width: '44px',
              height: '44px',
              background: '#000',
              border: 'none',
              color: '#FFF',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Block library, grouped */}
      {BLOCK_GROUPS.map((group) => (
        <section key={group.key} aria-labelledby={`block-group-${group.key}`} style={{ marginBottom: '20px' }}>
          <h3
            id={`block-group-${group.key}`}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#666666',
              margin: '0 0 8px 0',
            }}
          >
            {groupLabels[group.key]}
          </h3>
          {group.types.map((type) => (
            <DraggableBlock
              key={type}
              type={type}
              label={blockCopy[type.toLowerCase()]?.label ?? type}
              description={blockCopy[type.toLowerCase()]?.description ?? ''}
              isMobile={isMobile}
              onAdd={handleAdd}
            />
          ))}
        </section>
      ))}

      <style jsx global>{`
        .sidebar-block:hover:not([data-dragging]) {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        .sidebar-block .sidebar-block-plus {
          opacity: 0.35;
        }
        .sidebar-block:hover .sidebar-block-plus,
        .sidebar-block:focus-visible .sidebar-block-plus {
          opacity: 1;
        }
      `}</style>

      {/* Help Text */}
      <div
        style={{
          marginTop: '12px',
          padding: '16px',
          backgroundColor: '#FFFFFF',
          border: '2px solid #000000',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            color: '#666666',
            margin: 0,
            lineHeight: '1.6',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}
        >
          {isMobile
            ? t.builder.sidebar.helpTextMobile
            : t.builder.sidebar.helpTextDesktop}
        </p>
      </div>
    </div>
    </>
  );
}
