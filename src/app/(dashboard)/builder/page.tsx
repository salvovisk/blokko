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
import SaveTemplateModal from '@/components/modals/SaveTemplateModal';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCsrf, withCsrf } from '@/hooks/useCsrf';
import { generatePDF, downloadPDF, getPDFDataURL } from '@/lib/pdf-generator';

export default function BuilderPage() {
  const { t } = useLanguage();
  const { token: csrfToken } = useCsrf();
  const { blocks, addBlock, moveBlock, quoteTitle, quoteId, loadQuote, saveAsTemplate } = useBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { toast, showToast, hideToast } = useToast();

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

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        if (!isSaving) {
          handleSave();
        }
      },
      description: 'Save quote',
    },
  ]);

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
    } catch (error) {
      console.error('Error loading quote:', error);
      showToast(t.builder.messages.quoteLoadFailed, 'error');
    }
  };

  const handleSave = async () => {
    if (!quoteTitle.trim()) {
      showToast(t.builder.messages.titleRequired, 'error');
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
        response = await fetch(`/api/quotes/${quoteId}`, withCsrf(csrfToken, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }));
      } else {
        // Create new quote
        response = await fetch('/api/quotes', withCsrf(csrfToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }));
      }

      if (!response.ok) {
        throw new Error('Failed to save quote');
      }

      const savedQuote = await response.json();

      // Update store with saved quote ID
      if (!quoteId) {
        loadQuote(savedQuote.id, savedQuote.title, savedQuote.blocks);
        // Update URL with quote ID without navigation
        router.replace(`/builder?id=${savedQuote.id}`, { scroll: false });
      }

      showToast(t.builder.messages.quoteSaved, 'success');
    } catch (error) {
      console.error('Error saving quote:', error);
      showToast(t.builder.messages.quoteSaveFailed, 'error');
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
      showToast(t.builder.messages.previewFailed, 'error');
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
      showToast(t.builder.messages.pdfExported, 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast(t.builder.messages.pdfExportFailed, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveAsTemplate = async (name: string, description?: string) => {
    const result = await saveAsTemplate(name, description);

    if (result.success) {
      showToast(t.builder.messages.templateSaved, 'success');
    } else {
      throw new Error(result.error || 'Failed to save template');
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

      // Find the index to insert at based on the drop target
      let insertIndex: number | undefined;

      if (over.id === 'canvas-droppable') {
        // Dropped on empty canvas - add at end
        insertIndex = undefined;
      } else {
        // Dropped on an existing block - insert after that block
        const overIndex = blocks.findIndex((b) => b.id === over.id);
        if (overIndex !== -1) {
          insertIndex = overIndex + 1;
        }
      }

      addBlock(blockType, insertIndex);
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
      const blockIcons: Record<BlockType, string> = {
        HEADER: '◼',
        PRICES: '▦',
        TEXT: '▣',
        TERMS: '▨',
        FAQ: '◉',
        TABLE: '▥',
        TIMELINE: '◫',
        CONTACT: '◬',
        DISCOUNT: '◭',
        PAYMENT: '◮',
        SIGNATURE: '◯',
      };
      return { type: blockType, icon: blockIcons[blockType], isNew: true };
    }

    // It's an existing block being reordered
    const block = blocks.find((b) => b.id === activeId);
    if (block) {
      const blockIcons: Record<BlockType, string> = {
        HEADER: '◼',
        PRICES: '▦',
        TEXT: '▣',
        TERMS: '▨',
        FAQ: '◉',
        TABLE: '▥',
        TIMELINE: '◫',
        CONTACT: '◬',
        DISCOUNT: '◭',
        PAYMENT: '◮',
        SIGNATURE: '◯',
      };
      return { type: block.type, icon: blockIcons[block.type as BlockType], isNew: false };
    }

    return null;
  };

  const activeBlock = getActiveBlock();

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          {/* Toolbar */}
          <BuilderToolbar
            onSave={handleSave}
            onPreview={handlePreview}
            onExportPDF={handleExportPDF}
            onSaveAsTemplate={() => setShowTemplateModal(true)}
            isSaving={isSaving}
            isExporting={isExporting}
          />

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
              border: '3px solid #000000',
              padding: '24px',
              width: 'calc(100vw - 80px)',
              height: 'calc(100vh - 80px)',
              maxWidth: '1400px',
              maxHeight: '900px',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '3px solid #000000' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PDF PREVIEW</h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  border: '3px solid #000000',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                CLOSE
              </button>
            </div>
            <iframe
              src={previewURL}
              style={{
                flex: 1,
                width: '100%',
                border: '3px solid #000000',
              }}
              title="PDF Preview"
            />
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      <SaveTemplateModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSave={handleSaveAsTemplate}
      />
    </>
  );
}
