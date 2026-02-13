'use client';

import { useDraggable } from '@dnd-kit/core';
import type { BlockType } from '@/types/blocks';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/stores/builder-store';
import { Tooltip } from '@mui/material';

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
  icon: string;
  label: string;
  description: string;
  isMobile?: boolean;
  onMobileTap?: (type: BlockType) => void;
}

function DraggableBlock({ type, icon, label, description, isMobile, onMobileTap }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${type}`,
    data: {
      type,
      isNew: true,
    },
    disabled: isMobile, // Disable drag on mobile
  });

  const handleClick = () => {
    if (isMobile && onMobileTap) {
      onMobileTap(type);
    }
  };

  return (
    <Tooltip
      title={description}
      placement="right"
      arrow
      enterDelay={300}
      disableInteractive
      slotProps={{
        tooltip: {
          sx: {
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '12px',
            backgroundColor: '#000000',
            border: '2px solid #000000',
            padding: '8px 12px',
          },
        },
        arrow: {
          sx: {
            color: '#000000',
          },
        },
      }}
    >
      <div
        ref={!isMobile ? setNodeRef : undefined}
        {...(!isMobile ? listeners : {})}
        {...(!isMobile ? attributes : {})}
        onClick={handleClick}
        style={{
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: isDragging ? '#000000' : '#FFFFFF',
        border: '3px solid #000000',
        cursor: isMobile ? 'pointer' : isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? 'scale(0.95) rotate(-2deg)' : 'scale(1) rotate(0deg)',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragging ? 'none' : '0 0 0 0 rgba(0, 0, 0, 0)',
        position: 'relative' as const,
        minHeight: isMobile ? '64px' : 'auto',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        if (!isDragging && !isMobile) {
          e.currentTarget.style.transform = 'scale(1.02) translateX(4px)';
          e.currentTarget.style.boxShadow = '8px 8px 0 0 rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging && !isMobile) {
          e.currentTarget.style.transform = 'scale(1) translateX(0)';
          e.currentTarget.style.boxShadow = '0 0 0 0 rgba(0, 0, 0, 0)';
        }
      }}
      onTouchStart={(e) => {
        if (isMobile) {
          e.currentTarget.style.backgroundColor = '#F0F0F0';
        }
      }}
      onTouchEnd={(e) => {
        if (isMobile) {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: isDragging ? '#FFFFFF' : '#000000',
          transition: 'color 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {label}
        </span>
      </div>
      </div>
    </Tooltip>
  );
}

export default function BuilderSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { addBlock } = useBuilderStore();

  const blocks: Array<{ type: BlockType; icon: string; label: string; description: string }> = [
    {
      type: 'HEADER',
      icon: '◼',
      label: 'Header',
      description: 'Company and client information with quote number and date'
    },
    {
      type: 'PRICES',
      icon: '▦',
      label: 'Prices',
      description: 'Itemized pricing table with automatic calculations and tax'
    },
    {
      type: 'TEXT',
      icon: '▣',
      label: 'Text',
      description: 'Free-form text content with optional title for descriptions'
    },
    {
      type: 'TERMS',
      icon: '▨',
      label: 'Terms',
      description: 'Terms and conditions list with customizable items'
    },
  ];

  // Handle mobile tap to add block
  const handleMobileTap = (blockType: BlockType) => {
    addBlock(blockType);
    setIsOpen(false); // Close modal after adding
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
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#000',
            border: '3px solid #000',
            color: '#FFF',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
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
            BLOCK LIBRARY
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
            {isMobile ? 'Tap to add blocks' : 'Drag blocks to canvas'}
          </p>
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: '32px',
              height: '32px',
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
            ×
          </button>
        )}
      </div>

      {/* Draggable Blocks */}
      <div>
        {blocks.map((block) => (
          <DraggableBlock
            key={block.type}
            type={block.type}
            icon={block.icon}
            label={block.label}
            description={block.description}
            isMobile={isMobile}
            onMobileTap={handleMobileTap}
          />
        ))}
      </div>

      {/* Help Text */}
      <div
        style={{
          marginTop: '32px',
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
            ? 'Tap any block above to add it to your quote.'
            : 'Click and drag blocks to the canvas to build your quote.'}
        </p>
      </div>
    </div>
    </>
  );
}
