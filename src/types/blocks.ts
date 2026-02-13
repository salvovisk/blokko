// Block Types for BLOKKO Quote Builder

export type BlockType = 'HEADER' | 'PRICES' | 'TEXT' | 'TERMS' | 'FAQ' | 'TABLE' | 'TIMELINE' | 'CONTACT' | 'DISCOUNT' | 'PAYMENT' | 'SIGNATURE';

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

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqBlockData {
  title: string;
  faqs: FaqItem[];
  showNumbering: boolean;
}

export interface FaqBlock extends BaseBlock {
  type: 'FAQ';
  data: FaqBlockData;
}

export interface TableBlockData {
  title: string;
  headers: string[];
  rows: string[][];
  footers?: string[];
  alignment: ('left' | 'center' | 'right')[];
  showBorders: boolean;
}

export interface TableBlock extends BaseBlock {
  type: 'TABLE';
  data: TableBlockData;
}

export interface TimelineMilestone {
  id: string;
  phase: string;
  duration: string;
  deliverables: string;
  dueDate?: string;
}

export interface TimelineBlockData {
  title: string;
  startDate: string;
  milestones: TimelineMilestone[];
  notes: string;
}

export interface TimelineBlock extends BaseBlock {
  type: 'TIMELINE';
  data: TimelineBlockData;
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  bio?: string;
}

export interface ContactBlockData {
  title: string;
  contacts: ContactPerson[];
  layout: 'list' | 'grid';
}

export interface ContactBlock extends BaseBlock {
  type: 'CONTACT';
  data: ContactBlockData;
}

export interface DiscountBlockData {
  title: string;
  offerType: 'percentage' | 'fixed' | 'package';
  discountValue: number;
  description: string;
  validUntil?: string;
  conditions: string[];
  highlightColor?: string;
}

export interface DiscountBlock extends BaseBlock {
  type: 'DISCOUNT';
  data: DiscountBlockData;
}

export interface PaymentMilestone {
  id: string;
  milestone: string;
  percentage: number;
  amount?: number;
}

export interface BankingInfo {
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
}

export interface PaymentBlockData {
  title: string;
  schedule: PaymentMilestone[];
  bankingInfo: BankingInfo;
  acceptedMethods: string[];
  notes: string;
}

export interface PaymentBlock extends BaseBlock {
  type: 'PAYMENT';
  data: PaymentBlockData;
}

export interface SignatureBlockData {
  title: string;
  approvalText: string;
  signatureLabel: string;
  dateLabel: string;
  showCompanySignature: boolean;
}

export interface SignatureBlock extends BaseBlock {
  type: 'SIGNATURE';
  data: SignatureBlockData;
}

export type Block = HeaderBlock | PricesBlock | TextBlock | TermsBlock | FaqBlock | TableBlock | TimelineBlock | ContactBlock | DiscountBlock | PaymentBlock | SignatureBlock;

export interface Quote {
  id: string;
  title: string;
  description?: string;
  blocks: Block[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  blocks: Block[];
  isSystem: boolean;
  isOwner?: boolean; // Added by API
  createdAt: Date;
  updatedAt: Date;
}
