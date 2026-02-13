// Block Types for BLOKKO Quote Builder

export type BlockType = 'HEADER' | 'PRICES' | 'TEXT' | 'TERMS';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface BaseBlock {
  id: string;
  type: BlockType;
  saveState?: SaveState;
}

export interface HeaderBlockData {
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  quoteNumber: string;
  date: string;
  validUntil?: string;
}

export interface HeaderBlock extends BaseBlock {
  type: 'HEADER';
  data: HeaderBlockData;
}

export interface PriceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PricesBlockData {
  items: PriceItem[];
  currency: string;
  taxRate: number;
  showTax: boolean;
  subtotal: number;
  tax: number;
  total: number;
}

export interface PricesBlock extends BaseBlock {
  type: 'PRICES';
  data: PricesBlockData;
}

export interface TextBlockData {
  title?: string;
  content: string;
}

export interface TextBlock extends BaseBlock {
  type: 'TEXT';
  data: TextBlockData;
}

export interface TermsBlockData {
  title: string;
  terms: string[];
}

export interface TermsBlock extends BaseBlock {
  type: 'TERMS';
  data: TermsBlockData;
}

export type Block = HeaderBlock | PricesBlock | TextBlock | TermsBlock;

export interface Quote {
  id: string;
  title: string;
  description?: string;
  blocks: Block[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
