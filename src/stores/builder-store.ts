import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Block, BlockType, HeaderBlockData, PricesBlockData, TextBlockData, TermsBlockData, SaveState } from '@/types/blocks';

interface BuilderState {
  blocks: Block[];
  activeBlockId: string | null;
  quoteTitle: string;
  quoteId: string | null;
  lastSaved: Date | null;

  // Actions
  addBlock: (type: BlockType, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, data: Partial<Block['data']>) => void;
  updateBlockWithAutoSave: (id: string, data: Partial<Block['data']>, onSave?: () => Promise<void>) => void;
  setBlockSaveState: (id: string, saveState: SaveState) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setActiveBlock: (id: string | null) => void;
  setQuoteTitle: (title: string) => void;
  loadQuote: (quoteId: string, title: string, blocks: Block[]) => void;
  clearBuilder: () => void;
  duplicateBlock: (id: string) => void;
}

const createDefaultBlockData = (type: BlockType): Block['data'] => {
  switch (type) {
    case 'HEADER':
      return {
        companyName: 'Your Company',
        clientName: 'Client Name',
        quoteNumber: `Q-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
      } as HeaderBlockData;

    case 'PRICES':
      return {
        items: [],
        currency: 'EUR',
        taxRate: 22,
        showTax: true,
        subtotal: 0,
        tax: 0,
        total: 0,
      } as PricesBlockData;

    case 'TEXT':
      return {
        content: 'Enter your text here...',
      } as TextBlockData;

    case 'TERMS':
      return {
        title: 'Terms & Conditions',
        terms: [
          'Payment due within 30 days',
          'Prices valid for 30 days',
          'All work subject to agreement',
        ],
      } as TermsBlockData;

    default:
      return {} as any;
  }
};

// Debounced auto-save timeout storage
let autoSaveTimeouts: Record<string, NodeJS.Timeout> = {};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  activeBlockId: null,
  quoteTitle: 'Untitled Quote',
  quoteId: null,
  lastSaved: null,

  addBlock: (type, index) => {
    const newBlock: Block = {
      id: nanoid(),
      type,
      data: createDefaultBlockData(type),
      saveState: 'idle',
    } as Block;

    set((state) => {
      const blocks = [...state.blocks];
      if (index !== undefined) {
        blocks.splice(index, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }
      return { blocks, activeBlockId: newBlock.id };
    });
  },

  removeBlock: (id) => {
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      activeBlockId: state.activeBlockId === id ? null : state.activeBlockId,
    }));
  },

  updateBlock: (id, data) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, data: { ...block.data, ...data } as any }
          : block
      ),
    }));
  },

  updateBlockWithAutoSave: (id, data, onSave) => {
    // Optimistically update the block with 'saving' state
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, data: { ...block.data, ...data } as any, saveState: 'saving' as SaveState }
          : block
      ),
    }));

    // Clear any existing timeout for this block
    if (autoSaveTimeouts[id]) {
      clearTimeout(autoSaveTimeouts[id]);
    }

    // Debounce the actual save operation
    autoSaveTimeouts[id] = setTimeout(async () => {
      try {
        // Call the save callback if provided
        if (onSave) {
          await onSave();
        }

        // Update to 'saved' state
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id
              ? { ...block, saveState: 'saved' as SaveState }
              : block
          ),
          lastSaved: new Date(),
        }));

        // Reset to 'idle' after 1 second
        setTimeout(() => {
          set((state) => ({
            blocks: state.blocks.map((block) =>
              block.id === id
                ? { ...block, saveState: 'idle' as SaveState }
                : block
            ),
          }));
        }, 1000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Update to 'error' state
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id
              ? { ...block, saveState: 'error' as SaveState }
              : block
          ),
        }));
      }
    }, 1000); // 1 second debounce
  },

  setBlockSaveState: (id, saveState) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, saveState }
          : block
      ),
    }));
  },

  moveBlock: (fromIndex, toIndex) => {
    set((state) => {
      const blocks = [...state.blocks];
      const [removed] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, removed);
      return { blocks };
    });
  },

  setActiveBlock: (id) => {
    set({ activeBlockId: id });
  },

  setQuoteTitle: (title) => {
    set({ quoteTitle: title });
  },

  loadQuote: (quoteId, title, blocks) => {
    set({
      quoteId,
      quoteTitle: title,
      blocks,
      activeBlockId: null,
    });
  },

  clearBuilder: () => {
    set({
      blocks: [],
      activeBlockId: null,
      quoteTitle: 'Untitled Quote',
      quoteId: null,
    });
  },

  duplicateBlock: (id) => {
    const block = get().blocks.find((b) => b.id === id);
    if (block) {
      const newBlock = {
        ...block,
        id: nanoid(),
        saveState: 'idle' as SaveState,
      };
      set((state) => ({
        blocks: [...state.blocks, newBlock],
        activeBlockId: newBlock.id,
      }));
    }
  },
}));
