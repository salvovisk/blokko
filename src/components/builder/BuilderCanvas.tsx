'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '@/stores/builder-store';
import type { Block, BlockType } from '@/types/blocks';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BlockActionRail } from './BlockActionRail';
import { BlockFocusToolbar } from './BlockFocusToolbar';
import { CommandPalette, Command } from './CommandPalette';
import { useBlockKeyboardShortcuts } from '@/hooks/useBlockKeyboardShortcuts';
import { useLanguage } from '@/contexts/LanguageContext';

// Dynamically import block components
const HeaderBlock = dynamic(() => import('@/components/blocks/HeaderBlock'));
const PricesBlock = dynamic(() => import('@/components/blocks/PricesBlock'));
const TextBlock = dynamic(() => import('@/components/blocks/TextBlock'));
const TermsBlock = dynamic(() => import('@/components/blocks/TermsBlock'));
const FaqBlock = dynamic(() => import('@/components/blocks/FaqBlock'));
const TableBlock = dynamic(() => import('@/components/blocks/TableBlock'));
const TimelineBlock = dynamic(() => import('@/components/blocks/TimelineBlock'));
const ContactBlock = dynamic(() => import('@/components/blocks/ContactBlock'));
const DiscountBlock = dynamic(() => import('@/components/blocks/DiscountBlock'));
const PaymentBlock = dynamic(() => import('@/components/blocks/PaymentBlock'));
const SignatureBlock = dynamic(() => import('@/components/blocks/SignatureBlock'));

interface SortableBlockWrapperProps {
  block: Block;
  children: React.ReactNode;
  index: number;
  totalBlocks: number;
}

function SortableBlockWrapper({ block, children, index, totalBlocks }: SortableBlockWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { removeBlock, duplicateBlock, moveBlock, activeBlockId, setActiveBlock } = useBuilderStore();

  const isActive = activeBlockId === block.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: block.id,
    data: {
      type: block.type,
      blockId: block.id,
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    // Animate out before removing (600ms to match animation)
    setTimeout(() => {
      removeBlock(block.id);
    }, 600);
  };

  const handleDuplicate = () => {
    duplicateBlock(block.id);
  };

  const handleMoveUp = () => {
    if (index > 0) {
      moveBlock(index, index - 1);
    }
  };

  const handleMoveDown = () => {
    if (index < totalBlocks - 1) {
      moveBlock(index, index + 1);
    }
  };

  // Staggered entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isDragging ? 0.3 : isVisible ? 1 : 0,
    scale: isDragging ? '0.98' : '1',
    animation: isDeleting ? 'blockFlashCrush 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards' : isVisible ? 'blockSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scaleY(1); }
            50% { opacity: 0.6; transform: scaleY(0.7); }
          }
          @keyframes blockSlideIn {
            0% {
              opacity: 0;
              transform: translateX(-32px) translateY(-8px) rotate(-2deg);
            }
            100% {
              opacity: 1;
              transform: translateX(0) translateY(0) rotate(0deg);
            }
          }
          @keyframes blockFlashCrush {
            0% {
              background-color: #FFFFFF;
              transform: scale(1);
              opacity: 1;
            }
            25% {
              background-color: #000000;
              transform: scale(0.98);
            }
            50% {
              background-color: #FFFFFF;
              transform: scale(0.96) scaleX(1.05);
            }
            75% {
              background-color: #000000;
              transform: scale(0.94) scaleX(1.08) scaleY(0.5);
              opacity: 0.7;
            }
            100% {
              background-color: #000000;
              transform: scale(0.92) scaleX(1.1) scaleY(0);
              opacity: 0;
            }
          }
          @keyframes flashLine {
            0% {
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Drop Zone Indicator - Shows when another block is being dragged over */}
      {isOver && (
        <div
          style={{
            height: '8px',
            backgroundColor: '#000000',
            marginBottom: '8px',
            animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            position: 'relative' as const,
          }}
        />
      )}

      {/* Hover Zone - Wraps both action rail and block */}
      <div
        style={{
          position: 'relative',
          marginBottom: '16px',
          paddingLeft: '48px', // Space for action rail
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Action Rail */}
        <BlockActionRail
          blockId={block.id}
          blockIndex={index}
          totalBlocks={totalBlocks}
          isVisible={isHovered || isActive}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          isDragging={isDragging}
        />

        {/* Block Container */}
        <div
          style={{
            border: isDragging ? '3px dashed #000000' : '3px solid #000000',
            backgroundColor: '#FFFFFF',
            position: 'relative' as const,
            boxShadow: isDragging ? 'none' : isOver ? '12px 12px 0 0 rgba(0, 0, 0, 0.15)' : '0 0 0 0 rgba(0, 0, 0, 0)',
            transform: isDragging ? 'rotate(-1deg)' : 'rotate(0deg)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'none',
          }}
          onClick={() => setActiveBlock(block.id)}
        >
        {/* Flash line overlay during delete */}
        {isDeleting && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: '3px',
                backgroundColor: '#FFFFFF',
                animation: 'flashLine 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        )}
        {/* Drag Handle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isDragging ? '#666666' : '#000000',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            {...attributes}
            {...listeners}
            style={{
              flex: 1,
              padding: '12px 16px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              cursor: isDragging ? 'grabbing' : 'grab',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              touchAction: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isDragging) {
                const parent = e.currentTarget.parentElement;
                if (parent) parent.style.backgroundColor = '#333333';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDragging) {
                const parent = e.currentTarget.parentElement;
                if (parent) parent.style.backgroundColor = '#000000';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>≡</span>
              <span>{block.type}</span>
            </span>
            <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 600 }}>
              {isDragging ? 'DRAGGING...' : 'DRAG TO REORDER'}
            </span>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              padding: '12px 16px',
              backgroundColor: isDeleting ? '#666666' : '#DC2626',
              border: 'none',
              borderLeft: '2px solid #000000',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '48px',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#991B1B';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#DC2626';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            title="Delete block"
          >
            ×
          </button>
        </div>

        {/* Block Content */}
        <div style={{ padding: '16px' }}>{children}</div>
        </div>
        {/* End Block Container */}
      </div>
      {/* End Hover Zone */}
    </div>
  );
}

interface BlockRendererProps {
  block: Block;
  isActive: boolean;
}

function BlockRenderer({ block, isActive }: BlockRendererProps) {
  switch (block.type) {
    case 'HEADER':
      return <HeaderBlock block={block} isActive={isActive} />;
    case 'PRICES':
      return <PricesBlock block={block} isActive={isActive} />;
    case 'TEXT':
      return <TextBlock block={block} isActive={isActive} />;
    case 'TERMS':
      return <TermsBlock block={block} isActive={isActive} />;
    case 'FAQ':
      return <FaqBlock block={block} isActive={isActive} />;
    case 'TABLE':
      return <TableBlock block={block} isActive={isActive} />;
    case 'TIMELINE':
      return <TimelineBlock block={block} isActive={isActive} />;
    case 'CONTACT':
      return <ContactBlock block={block} isActive={isActive} />;
    case 'DISCOUNT':
      return <DiscountBlock block={block} isActive={isActive} />;
    case 'PAYMENT':
      return <PaymentBlock block={block} isActive={isActive} />;
    case 'SIGNATURE':
      return <SignatureBlock block={block} isActive={isActive} />;
    default:
      return <div>Unknown block type</div>;
  }
}

export default function BuilderCanvas() {
  const {
    blocks,
    activeBlockId,
    setActiveBlock,
    addBlock,
    duplicateBlock,
    removeBlock,
    moveBlock,
  } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { t } = useLanguage();

  const isEmpty = !blocks || blocks.length === 0;
  const activeBlockIndex = blocks?.findIndex((b) => b.id === activeBlockId) ?? -1;

  // Define commands for command palette
  const commands: Command[] = [
    // Add block commands
    {
      id: 'add-header',
      label: 'Add Header Block',
      category: 'Add',
      keywords: ['create', 'new', 'header', 'company', 'client'],
      action: () => addBlock('HEADER'),
    },
    {
      id: 'add-prices',
      label: 'Add Prices Block',
      category: 'Add',
      keywords: ['create', 'new', 'prices', 'table', 'items'],
      action: () => addBlock('PRICES'),
    },
    {
      id: 'add-text',
      label: 'Add Text Block',
      category: 'Add',
      keywords: ['create', 'new', 'text', 'content', 'paragraph'],
      action: () => addBlock('TEXT'),
    },
    {
      id: 'add-terms',
      label: 'Add Terms Block',
      category: 'Add',
      keywords: ['create', 'new', 'terms', 'conditions'],
      action: () => addBlock('TERMS'),
    },
    {
      id: 'add-faq',
      label: 'Add FAQ Block',
      category: 'Add',
      keywords: ['create', 'new', 'faq', 'questions', 'answers'],
      action: () => addBlock('FAQ'),
    },
    {
      id: 'add-table',
      label: 'Add Table Block',
      category: 'Add',
      keywords: ['create', 'new', 'table', 'data', 'grid'],
      action: () => addBlock('TABLE'),
    },
    {
      id: 'add-timeline',
      label: 'Add Timeline Block',
      category: 'Add',
      keywords: ['create', 'new', 'timeline', 'schedule', 'milestones'],
      action: () => addBlock('TIMELINE'),
    },
    {
      id: 'add-contact',
      label: 'Add Contact Block',
      category: 'Add',
      keywords: ['create', 'new', 'contact', 'team', 'people'],
      action: () => addBlock('CONTACT'),
    },
    {
      id: 'add-discount',
      label: 'Add Discount Block',
      category: 'Add',
      keywords: ['create', 'new', 'discount', 'offer', 'promotion'],
      action: () => addBlock('DISCOUNT'),
    },
    {
      id: 'add-payment',
      label: 'Add Payment Block',
      category: 'Add',
      keywords: ['create', 'new', 'payment', 'banking', 'terms'],
      action: () => addBlock('PAYMENT'),
    },
    {
      id: 'add-signature',
      label: 'Add Signature Block',
      category: 'Add',
      keywords: ['create', 'new', 'signature', 'approval', 'sign'],
      action: () => addBlock('SIGNATURE'),
    },
  ];

  // Add edit commands if there's an active block
  if (activeBlockId && activeBlockIndex !== -1 && blocks && blocks[activeBlockIndex]) {
    commands.push({
      id: 'duplicate-active',
      label: `Duplicate ${blocks[activeBlockIndex].type} Block`,
      category: 'Edit',
      keywords: ['copy', 'duplicate', 'clone'],
      shortcut: '⌘D',
      action: () => duplicateBlock(activeBlockId),
    });

    commands.push({
      id: 'delete-active',
      label: `Delete ${blocks[activeBlockIndex].type} Block`,
      category: 'Edit',
      keywords: ['remove', 'delete'],
      shortcut: '⌘⌫',
      action: () => removeBlock(activeBlockId),
    });

    if (activeBlockIndex > 0) {
      commands.push({
        id: 'move-up',
        label: 'Move Block Up',
        category: 'Edit',
        shortcut: '⌘↑',
        action: () => moveBlock(activeBlockIndex, activeBlockIndex - 1),
      });
    }

    if (activeBlockIndex < blocks.length - 1) {
      commands.push({
        id: 'move-down',
        label: 'Move Block Down',
        category: 'Edit',
        shortcut: '⌘↓',
        action: () => moveBlock(activeBlockIndex, activeBlockIndex + 1),
      });
    }
  }

  // Keyboard shortcut handlers
  useBlockKeyboardShortcuts({
    onCommandPalette: () => setCommandPaletteOpen(true),
    onDuplicate: () => {
      if (activeBlockId) {
        duplicateBlock(activeBlockId);
      }
    },
    onDelete: () => {
      if (activeBlockId) {
        removeBlock(activeBlockId);
      }
    },
    onMoveUp: () => {
      if (activeBlockIndex > 0) {
        moveBlock(activeBlockIndex, activeBlockIndex - 1);
      }
    },
    onMoveDown: () => {
      if (blocks && activeBlockIndex < blocks.length - 1) {
        moveBlock(activeBlockIndex, activeBlockIndex + 1);
      }
    },
    onSave: () => {
      // Blur active input to trigger save
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    },
    onCancel: () => {
      setActiveBlock(null);
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        padding: '24px',
        backgroundColor: isOver ? '#FAFAFA' : '#FFFFFF',
        overflowY: 'auto',
        minHeight: '100%',
        transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative' as const,
      }}
    >
      {/* Active Drop Zone Overlay */}
      {isOver && (
        <div
          style={{
            position: 'fixed' as const,
            top: 0,
            left: 300,
            right: 0,
            bottom: 0,
            border: '8px solid #000000',
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'dropZonePulse 1.5s ease-in-out infinite',
          }}
        >
          <style>
            {`
              @keyframes dropZonePulse {
                0%, 100% {
                  border-width: 8px;
                  opacity: 1;
                }
                50% {
                  border-width: 4px;
                  opacity: 0.7;
                }
              }
            `}
          </style>
        </div>
      )}

      {isEmpty ? (
        // Empty State
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            border: isOver ? '3px solid #000000' : '3px dashed #CCCCCC',
            backgroundColor: isOver ? '#FFFFFF' : '#FAFAFA',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOver ? 'scale(1.01)' : 'scale(1)',
            boxShadow: isOver ? '16px 16px 0 0 rgba(0, 0, 0, 0.1)' : 'none',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '64px',
                marginBottom: '16px',
                opacity: isOver ? 0.8 : 0.3,
                transform: isOver ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              ▦
            </div>
            <p
              style={{
                fontSize: isOver ? '18px' : '16px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isOver ? '#000000' : '#666666',
                margin: 0,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {isOver ? t.builder.canvas.dropToAdd : t.builder.canvas.emptyState}
            </p>
            {!isOver && (
              <p
                style={{
                  fontSize: '11px',
                  color: '#999999',
                  marginTop: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                }}
              >
                {t.builder.canvas.emptyStateHint}
              </p>
            )}
          </div>
        </div>
      ) : (
        // Blocks Container
        <SortableContext
          items={blocks?.map((b) => b.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {blocks?.map((block, index) => {
            const isActive = block.id === activeBlockId;
            return (
              <SortableBlockWrapper
                key={block.id}
                block={block}
                index={index}
                totalBlocks={blocks?.length || 0}
              >
                {/* Focus Toolbar */}
                {isActive && (
                  <BlockFocusToolbar
                    blockType={block.type}
                    saveState={block.saveState}
                  />
                )}

                {/* Block Content */}
                <BlockRenderer block={block} isActive={isActive} />
              </SortableBlockWrapper>
            );
          })}
        </SortableContext>
      )}

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}
