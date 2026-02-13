'use client';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBuilderStore } from '@/stores/builder-store';
import { BlockType } from '@/types/blocks';
import BuilderSidebar from '@/components/builder/BuilderSidebar';
import BuilderCanvas from '@/components/builder/BuilderCanvas';
import BuilderToolbar from '@/components/builder/BuilderToolbar';
import { generatePDF, downloadPDF, getPDFDataURL } from '@/lib/pdf-generator';

export default function BuilderPage() {
  const { blocks, addBlock, moveBlock, quoteTitle, quoteId, loadQuote } = useBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Configure sensors for better mobile touch support
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px movement required before drag starts
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 250ms hold before drag starts (prevents text selection)
      tolerance: 5, // 5px of movement tolerance
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // Load quote from URL param on mount
  useEffect(() => {
    const id = searchParams.get('id');
    if (id && id !== quoteId) {
      loadQuoteFromAPI(id);
    }
  }, [searchParams]);

  const loadQuoteFromAPI = async (id: string) => {
    try {
      const response = await fetch(`/api/quotes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load quote');
      }
      const quote = await response.json();
      loadQuote(quote.id, quote.title, quote.blocks);
      showMessage('success', 'Quote loaded successfully');
    } catch (error) {
      console.error('Error loading quote:', error);
      showMessage('error', 'Failed to load quote');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!quoteTitle.trim()) {
      showMessage('error', 'Please enter a quote title');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: quoteTitle,
        blocks: blocks,
      };

      let response;
      if (quoteId) {
        // Update existing quote
        response = await fetch(`/api/quotes/${quoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new quote
        response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save quote');
      }

      const savedQuote = await response.json();

      // Update store with saved quote ID
      if (!quoteId) {
        loadQuote(savedQuote.id, savedQuote.title, savedQuote.blocks);
        // Update URL with quote ID
        router.push(`/builder?id=${savedQuote.id}`);
      }

      showMessage('success', 'Quote saved successfully');
    } catch (error) {
      console.error('Error saving quote:', error);
      showMessage('error', 'Failed to save quote');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const pdfBlob = generatePDF({
        title: quoteTitle,
        blocks: blocks,
      });

      const dataURL = await getPDFDataURL(pdfBlob);
      setPreviewURL(dataURL);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      showMessage('error', 'Failed to generate preview');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdfBlob = generatePDF({
        title: quoteTitle,
        blocks: blocks,
      });

      const filename = `${quoteTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, filename);
      showMessage('success', 'PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showMessage('error', 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging a new block from sidebar
    if (active.data.current?.isNew) {
      const blockType = active.data.current?.type as BlockType;
      addBlock(blockType);
      return;
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(oldIndex, newIndex);
      }
    }
  };

  // Get the active block or block type being dragged
  const getActiveBlock = () => {
    if (!activeId) return null;

    // Check if it's a new block from sidebar
    if (typeof activeId === 'string' && activeId.startsWith('block-')) {
      const blockType = activeId.replace('block-', '') as BlockType;
      const blockIcons = {
        HEADER: '◼',
        PRICES: '▦',
        TEXT: '▣',
        TERMS: '▨',
      };
      return { type: blockType, icon: blockIcons[blockType], isNew: true };
    }

    // It's an existing block being reordered
    const block = blocks.find((b) => b.id === activeId);
    if (block) {
      const blockIcons = {
        HEADER: '◼',
        PRICES: '▦',
        TEXT: '▣',
        TERMS: '▨',
      };
      return { type: block.type, icon: blockIcons[block.type as BlockType], isNew: false };
    }

    return null;
  };

  const activeBlock = getActiveBlock();

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
          {/* Toolbar */}
          <BuilderToolbar
            onSave={handleSave}
            onPreview={handlePreview}
            onExportPDF={handleExportPDF}
            isSaving={isSaving}
            isExporting={isExporting}
          />

          {/* Success/Error Message */}
          {message && (
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: message.type === 'success' ? '#10B981' : '#EF4444',
                color: '#FFFFFF',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '14px',
              }}
            >
              {message.text}
            </div>
          )}

          {/* Main Builder Area */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar */}
            <BuilderSidebar />

            {/* Canvas */}
            <SortableContext items={blocks?.map((b) => b.id) || []} strategy={verticalListSortingStrategy}>
              <BuilderCanvas />
            </SortableContext>
          </div>
        </div>

        {/* Drag Overlay - Ghost element that follows cursor */}
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {activeBlock ? (
            <div
              style={{
                padding: '20px 24px',
                backgroundColor: '#000000',
                border: '3px solid #000000',
                color: '#FFFFFF',
                cursor: 'grabbing',
                transform: 'rotate(-3deg) scale(1.05)',
                boxShadow: '16px 16px 0 0 rgba(0, 0, 0, 0.3)',
                minWidth: '280px',
                animation: 'dragFloat 2s ease-in-out infinite',
              }}
            >
              <style>
                {`
                  @keyframes dragFloat {
                    0%, 100% { transform: rotate(-3deg) scale(1.05) translateY(0px); }
                    50% { transform: rotate(-3deg) scale(1.05) translateY(-4px); }
                  }
                `}
              </style>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    animation: 'iconSpin 4s linear infinite',
                  }}
                >
                  <style>
                    {`
                      @keyframes iconSpin {
                        0% { transform: rotate(0deg); }
                        25% { transform: rotate(5deg); }
                        75% { transform: rotate(-5deg); }
                        100% { transform: rotate(0deg); }
                      }
                    `}
                  </style>
                  {activeBlock.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: '4px',
                    }}
                  >
                    {activeBlock.type}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      opacity: 0.8,
                    }}
                  >
                    {activeBlock.isNew ? 'DROP TO ADD' : 'REORDERING...'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* PDF Preview Modal */}
      {showPreview && previewURL && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>PDF Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                CLOSE
              </button>
            </div>
            <iframe
              src={previewURL}
              style={{
                width: '800px',
                height: '600px',
                border: '2px solid #000000',
              }}
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </>
  );
}
