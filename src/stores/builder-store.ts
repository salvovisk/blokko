import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  Block,
  BlockType,
  HeaderBlockData,
  PricesBlockData,
  TextBlockData,
  TermsBlockData,
  FaqBlockData,
  TableBlockData,
  TimelineBlockData,
  ContactBlockData,
  DiscountBlockData,
  PaymentBlockData,
  SignatureBlockData,
  SaveState
} from '@/types/blocks';

interface HistorySnapshot {
  blocks: Block[];
  quoteTitle: string;
  quoteId: string | null;
}

interface BuilderState {
  blocks: Block[];
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  /** Last destructive change, so the page can offer an Undo toast. */
  lastRemoval: { kind: 'block' | 'clear'; blockType?: BlockType; seq: number } | null;
  activeBlockId: string | null;
  quoteTitle: string;
  quoteId: string | null;
  lastSaved: Date | null;

  // Actions
  undo: () => void;
  redo: () => void;
  addBlock: (type: BlockType, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, data: Partial<Block['data']>) => void;
  updateBlockWithAutoSave: (id: string, data: Partial<Block['data']>, onSave?: () => Promise<void>) => void;
  setBlockSaveState: (id: string, saveState: SaveState) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setActiveBlock: (id: string | null) => void;
  setQuoteTitle: (title: string) => void;
  loadQuote: (quoteId: string, title: string, blocks: Block[]) => void;
  /** First save of a new quote: remember its id without touching blocks or history. */
  markSaved: (quoteId: string) => void;
  clearBuilder: () => void;
  /** Blank builder for a brand-new quote: no undo toast, fresh history. */
  startNewQuote: () => void;
  duplicateBlock: (id: string) => void;
  loadTemplate: (templateId: string, templateName: string, blocks: Block[]) => void;
  saveAsTemplate: (name: string, description?: string, csrfToken?: string | null) => Promise<{ success: boolean; templateId?: string; error?: string }>;
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

    case 'FAQ':
      return {
        title: 'Frequently Asked Questions',
        faqs: [
          {
            id: nanoid(),
            question: 'What\'s included in the price?',
            answer: 'The price includes all services listed in the pricing section above.',
          },
          {
            id: nanoid(),
            question: 'How long will this take?',
            answer: 'The estimated timeline is detailed in the project schedule.',
          },
        ],
        showNumbering: true,
      } as FaqBlockData;

    case 'TABLE':
      return {
        title: 'Data Table',
        headers: ['Item', 'Description', 'Value'],
        rows: [
          ['Row 1', 'Sample data', '100'],
          ['Row 2', 'Sample data', '200'],
        ],
        footers: [],
        alignment: ['left', 'left', 'right'],
        showBorders: true,
      } as TableBlockData;

    case 'TIMELINE':
      return {
        title: 'Project Timeline',
        startDate: 'Upon approval',
        milestones: [
          {
            id: nanoid(),
            phase: 'Discovery & Planning',
            duration: '1 week',
            deliverables: 'Project plan, wireframes',
            dueDate: '',
          },
          {
            id: nanoid(),
            phase: 'Development',
            duration: '3 weeks',
            deliverables: 'Working prototype',
            dueDate: '',
          },
        ],
        notes: 'Timeline assumes timely client feedback and approvals.',
      } as TimelineBlockData;

    case 'CONTACT':
      return {
        title: 'Your Team',
        contacts: [
          {
            id: nanoid(),
            name: 'John Doe',
            role: 'Project Manager',
            email: 'john@company.com',
            phone: '',
            bio: '',
          },
        ],
        layout: 'list',
      } as ContactBlockData;

    case 'DISCOUNT':
      return {
        title: 'Special Offer',
        offerType: 'percentage',
        discountValue: 10,
        description: 'Book before the end of the month and save 10%',
        validUntil: '',
        conditions: ['Valid for new clients only', 'Full payment upfront'],
        highlightColor: '',
      } as DiscountBlockData;

    case 'PAYMENT':
      return {
        title: 'Payment Terms',
        schedule: [
          {
            id: nanoid(),
            milestone: 'Deposit (upon signing)',
            percentage: 50,
            amount: 0,
          },
          {
            id: nanoid(),
            milestone: 'Final payment (upon delivery)',
            percentage: 50,
            amount: 0,
          },
        ],
        bankingInfo: {
          accountName: 'Your Company Name',
          accountNumber: 'XXXX-XXXX-XXXX',
          routingNumber: 'XXXXXXX',
          swiftCode: '',
        },
        acceptedMethods: ['Bank Transfer', 'PayPal', 'Credit Card'],
        notes: 'Payment due within 7 days of invoice.',
      } as PaymentBlockData;

    case 'SIGNATURE':
      return {
        title: 'Client Approval',
        approvalText: 'By signing below, you accept the terms and pricing outlined in this quote.',
        signatureLabel: 'Client Signature',
        dateLabel: 'Date',
        showCompanySignature: false,
      } as SignatureBlockData;

    default:
      return {} as any;
  }
};

/** Blocks as persisted: without the UI-only save indicator. */
export function serializeBlocks(blocks: Block[]): Block[] {
  return blocks.map(({ saveState: _saveState, ...rest }) => rest as Block);
}

// Debounced auto-save timeout storage
let autoSaveTimeouts: Record<string, NodeJS.Timeout> = {};

// Undo history. Structural changes (add, remove, move, duplicate, clear,
// template load) always get their own step; typing in one block is coalesced
// into a single step until the user pauses or switches block.
const HISTORY_LIMIT = 50;
const EDIT_COALESCE_MS = 1500;
let lastEdit: { key: string; at: number } | null = null;

const takeSnapshot = (state: BuilderState): HistorySnapshot => ({
  blocks: state.blocks.map((b) => ({ ...b, saveState: 'idle' as SaveState })),
  quoteTitle: state.quoteTitle,
  quoteId: state.quoteId,
});

const recordHistory = (state: BuilderState) => {
  lastEdit = null;
  return {
    past: [...state.past, takeSnapshot(state)].slice(-HISTORY_LIMIT),
    future: [] as HistorySnapshot[],
  };
};

const recordEdit = (state: BuilderState, key: string) => {
  const now = Date.now();
  const coalesce = lastEdit && lastEdit.key === key && now - lastEdit.at < EDIT_COALESCE_MS;
  lastEdit = { key, at: now };
  if (coalesce) return {};
  return {
    past: [...state.past, takeSnapshot(state)].slice(-HISTORY_LIMIT),
    future: [] as HistorySnapshot[],
  };
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  past: [],
  future: [],
  lastRemoval: null,
  activeBlockId: null,
  quoteTitle: 'Untitled Quote',
  quoteId: null,
  lastSaved: null,

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return {};
      const previous = state.past[state.past.length - 1];
      lastEdit = null;
      return {
        ...previous,
        past: state.past.slice(0, -1),
        future: [takeSnapshot(state), ...state.future].slice(0, HISTORY_LIMIT),
        activeBlockId: previous.blocks.some((b) => b.id === state.activeBlockId) ? state.activeBlockId : null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return {};
      const [next, ...rest] = state.future;
      lastEdit = null;
      return {
        ...next,
        past: [...state.past, takeSnapshot(state)].slice(-HISTORY_LIMIT),
        future: rest,
        activeBlockId: next.blocks.some((b) => b.id === state.activeBlockId) ? state.activeBlockId : null,
      };
    });
  },

  addBlock: (type, index) => {
    const newBlock: Block = {
      id: nanoid(),
      type,
      data: createDefaultBlockData(type),
      saveState: 'idle',
    } as Block;

    set((state) => {
      const blocks = [...(state.blocks || [])];
      if (index !== undefined) {
        blocks.splice(index, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }
      return { ...recordHistory(state), blocks, activeBlockId: newBlock.id };
    });
  },

  removeBlock: (id) => {
    set((state) => ({
      ...recordHistory(state),
      lastRemoval: {
        kind: 'block',
        blockType: state.blocks.find((block) => block.id === id)?.type,
        seq: (state.lastRemoval?.seq ?? 0) + 1,
      },
      blocks: state.blocks.filter((block) => block.id !== id),
      activeBlockId: state.activeBlockId === id ? null : state.activeBlockId,
    }));
  },

  updateBlock: (id, data) => {
    set((state) => ({
      ...recordEdit(state, id),
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
      ...recordEdit(state, id),
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
      const blocks = [...(state.blocks || [])];
      const [removed] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, removed);
      return { ...recordHistory(state), blocks };
    });
  },

  setActiveBlock: (id) => {
    set({ activeBlockId: id });
  },

  setQuoteTitle: (title) => {
    set((state) => ({ ...recordEdit(state, '__title__'), quoteTitle: title }));
  },

  loadQuote: (quoteId, title, blocks) => {
    set({
      quoteId,
      quoteTitle: title,
      blocks: (blocks || []).map((b) => ({ ...b, saveState: 'idle' as SaveState })),
      activeBlockId: null,
      past: [],
      future: [],
    });
    lastEdit = null;
  },

  markSaved: (quoteId) => {
    set({ quoteId });
  },

  clearBuilder: () => {
    set((state) => ({
      ...recordHistory(state),
      lastRemoval: { kind: 'clear', seq: (state.lastRemoval?.seq ?? 0) + 1 },
      blocks: [],
      activeBlockId: null,
      quoteTitle: 'Untitled Quote',
      quoteId: null,
    }));
  },

  startNewQuote: () => {
    lastEdit = null;
    set({
      blocks: [],
      activeBlockId: null,
      quoteTitle: 'Untitled Quote',
      quoteId: null,
      past: [],
      future: [],
      lastRemoval: null,
    });
  },

  duplicateBlock: (id) => {
    const blocks = get().blocks || [];
    const index = blocks.findIndex((b) => b.id === id);
    if (index !== -1) {
      const block = blocks[index];
      // Deep copy so nested lists (items, terms, FAQs) are not shared
      const newBlock = {
        ...block,
        data: structuredClone(block.data),
        id: nanoid(),
        saveState: 'idle' as SaveState,
      } as Block;
      set((state) => ({
        ...recordHistory(state),
        // Place the copy right after the original
        blocks: [...state.blocks.slice(0, index + 1), newBlock, ...state.blocks.slice(index + 1)],
        activeBlockId: newBlock.id,
      }));
    }
  },

  loadTemplate: (templateId, templateName, blocks) => {
    // Generate fresh block IDs to avoid conflicts
    const blocksWithNewIds = (blocks || []).map((block) => ({
      ...block,
      id: nanoid(),
      saveState: 'idle' as SaveState,
    }));

    set((state) => ({
      ...recordHistory(state),
      blocks: blocksWithNewIds,
      quoteTitle: `${templateName} - Copy`,
      quoteId: null, // New quote, not editing existing
      activeBlockId: null,
    }));
  },

  saveAsTemplate: async (name, description, csrfToken) => {
    const { blocks } = get();

    // Validate blocks
    if (!blocks || blocks.length === 0) {
      return { success: false, error: 'No blocks to save as template' };
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          blocks: serializeBlocks(blocks),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to save template' };
      }

      const template = await response.json();
      return { success: true, templateId: template.id };
    } catch (error) {
      console.error('Save template error:', error);
      return { success: false, error: 'Network error' };
    }
  },
}));
