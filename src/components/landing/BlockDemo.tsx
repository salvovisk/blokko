'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type BlockType = 'HEADER' | 'PRICES' | 'TEXT' | 'TERMS';

interface Block {
  id: string;
  type: BlockType;
}

const blockIcons: Record<BlockType, string> = {
  HEADER: '◼',
  PRICES: '▦',
  TEXT: '▣',
  TERMS: '▨',
};

export default function BlockDemo() {
  const { t } = useLanguage();
  const [canvasBlocks, setCanvasBlocks] = useState<Block[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BlockType | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const availableBlocks: BlockType[] = ['HEADER', 'PRICES', 'TEXT', 'TERMS'];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragStart = (blockType: BlockType) => {
    setDraggedBlock(blockType);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const handleDrop = (index?: number) => {
    if (!draggedBlock) return;

    const newBlock: Block = {
      id: `${draggedBlock}-${Date.now()}`,
      type: draggedBlock,
    };

    if (index !== undefined) {
      // Insert at specific position
      const newBlocks = [...canvasBlocks];
      newBlocks.splice(index, 0, newBlock);
      setCanvasBlocks(newBlocks);
    } else {
      // Add to end
      setCanvasBlocks([...canvasBlocks, newBlock]);
    }

    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleReset = () => {
    setCanvasBlocks([]);
  };

  const removeBlock = (id: string) => {
    setCanvasBlocks(canvasBlocks.filter(block => block.id !== id));
  };

  // Mobile: tap to add block
  const handleMobileAdd = (blockType: BlockType) => {
    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
    };
    setCanvasBlocks([...canvasBlocks, newBlock]);
  };

  return (
    <div
      style={{
        marginTop: '80px',
        maxWidth: '1000px',
        margin: '80px auto 0',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h3
          style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '12px',
          }}
        >
          TRY IT: BUILD A QUOTE
        </h3>
        <p
          style={{
            fontSize: 'clamp(10px, 2vw, 11px)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#666',
            textTransform: 'uppercase',
          }}
        >
          {isMobile ? '↓ TAP BLOCKS TO ADD ↓' : '← DRAG BLOCKS FROM LEFT TO RIGHT →'}
        </p>
      </div>

      {/* Demo Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          border: '3px solid #000',
          padding: isMobile ? '20px' : '32px',
          background: '#FAFAFA',
        }}
      >
        {/* Block Library */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #000',
            }}
          >
            BLOCK LIBRARY
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableBlocks.map((blockType) => (
              <div
                key={blockType}
                draggable={!isMobile}
                onDragStart={!isMobile ? () => handleDragStart(blockType) : undefined}
                onDragEnd={!isMobile ? handleDragEnd : undefined}
                onClick={isMobile ? () => handleMobileAdd(blockType) : undefined}
                style={{
                  border: '3px solid #000',
                  padding: '16px',
                  background: '#FFF',
                  cursor: isMobile ? 'pointer' : 'grab',
                  transition: 'all 0.2s ease',
                  opacity: draggedBlock === blockType ? 0.5 : 1,
                  minHeight: '44px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '4px 4px 0 #000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onTouchStart={(e) => {
                  if (isMobile) {
                    e.currentTarget.style.background = '#F0F0F0';
                  }
                }}
                onTouchEnd={(e) => {
                  if (isMobile) {
                    e.currentTarget.style.background = '#FFF';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{blockIcons[blockType]}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em' }}>
                    {blockType}
                  </span>
                </div>

                {/* Block Preview */}
                <div style={{ fontSize: '8px', color: '#999', lineHeight: 1.4 }}>
                  {blockType === 'HEADER' && (
                    <>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <div style={{ width: '16px', height: '16px', background: '#000' }}></div>
                        <div>
                          <div style={{ background: '#DDD', height: '4px', width: '40px', marginBottom: '2px' }}></div>
                          <div style={{ background: '#EEE', height: '3px', width: '60px' }}></div>
                        </div>
                      </div>
                    </>
                  )}
                  {blockType === 'PRICES' && (
                    <>
                      <div style={{ background: '#EEE', height: '3px', marginBottom: '2px' }}></div>
                      <div style={{ background: '#DDD', height: '3px', marginBottom: '2px' }}></div>
                      <div style={{ background: '#EEE', height: '3px', marginBottom: '2px' }}></div>
                      <div style={{ background: '#000', height: '3px' }}></div>
                    </>
                  )}
                  {blockType === 'TEXT' && (
                    <>
                      <div style={{ background: '#DDD', height: '2px', marginBottom: '2px' }}></div>
                      <div style={{ background: '#DDD', height: '2px', marginBottom: '2px' }}></div>
                      <div style={{ background: '#DDD', height: '2px', width: '70%' }}></div>
                    </>
                  )}
                  {blockType === 'TERMS' && (
                    <>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                        <span>•</span>
                        <div style={{ background: '#DDD', height: '2px', flex: 1 }}></div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                        <span>•</span>
                        <div style={{ background: '#DDD', height: '2px', flex: 1 }}></div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span>•</span>
                        <div style={{ background: '#DDD', height: '2px', flex: 1 }}></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>YOUR QUOTE</span>
            {canvasBlocks.length > 0 && (
              <button
                onClick={handleReset}
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  padding: '6px 12px',
                  border: '2px solid #000',
                  background: '#FFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#000';
                  e.currentTarget.style.color = '#FFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFF';
                  e.currentTarget.style.color = '#000';
                }}
              >
                RESET
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => handleDragOver(e)}
            onDrop={() => handleDrop()}
            style={{
              minHeight: '300px',
              border: '3px dashed #CCC',
              background: '#FFF',
              padding: '16px',
              transition: 'all 0.2s ease',
              borderColor: draggedBlock ? '#000' : '#CCC',
              backgroundColor: draggedBlock ? '#F8F8F8' : '#FFF',
            }}
          >
            {canvasBlocks.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '268px',
                  color: '#CCC',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>⇠</div>
                <div>DROP BLOCKS HERE</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {canvasBlocks.map((block, index) => (
                  <div key={block.id}>
                    {/* Drop zone between blocks */}
                    <div
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      style={{
                        height: dragOverIndex === index ? '8px' : '0',
                        background: dragOverIndex === index ? '#000' : 'transparent',
                        transition: 'all 0.2s ease',
                        marginBottom: dragOverIndex === index ? '8px' : '0',
                      }}
                    />

                    <div
                      style={{
                        border: '2px solid #000',
                        padding: '12px',
                        background: block.type === 'PRICES' ? '#000' : '#FFF',
                        color: block.type === 'PRICES' ? '#FFF' : '#000',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{blockIcons[block.type]}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}>
                          {block.type}
                        </span>
                      </div>
                      <button
                        onClick={() => removeBlock(block.id)}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '4px 8px',
                          border: `1px solid ${block.type === 'PRICES' ? '#FFF' : '#000'}`,
                          background: 'transparent',
                          color: block.type === 'PRICES' ? '#FFF' : '#000',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = block.type === 'PRICES' ? '#FFF' : '#000';
                          e.currentTarget.style.color = block.type === 'PRICES' ? '#000' : '#FFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = block.type === 'PRICES' ? '#FFF' : '#000';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canvasBlocks.length > 0 && (
            <div
              style={{
                marginTop: '16px',
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#666',
                textAlign: 'center',
              }}
            >
              ✓ {canvasBlocks.length} BLOCK{canvasBlocks.length !== 1 ? 'S' : ''} ADDED
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div
        style={{
          marginTop: '24px',
          fontSize: 'clamp(9px, 2vw, 10px)',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textAlign: 'center',
          color: '#999',
          padding: '0 16px',
        }}
      >
        {isMobile
          ? 'TAP BLOCKS ABOVE TO ADD THEM TO YOUR QUOTE'
          : 'THIS IS HOW EASY IT IS TO BUILD QUOTES WITH BLOKKO'}
      </div>
    </div>
  );
}
