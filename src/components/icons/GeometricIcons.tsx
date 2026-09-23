// Geometric Brutalist Icons for BLOKKO
import type { ReactNode } from 'react';
// Swiss brutalist design - works on any background

export const QuotesIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="none" stroke="currentColor">
    {/* QUOTES: Stacked documents metaphor */}
    <rect x="4" y="10" width="18" height="18" strokeWidth="3"/>
    <rect x="7" y="7" width="18" height="18" strokeWidth="3"/>
    <rect x="10" y="4" width="18" height="18" strokeWidth="3" fill="currentColor"/>
  </svg>
);

export const BuilderIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor">
    {/* BUILDER: Construction blocks metaphor */}
    <rect x="4" y="4" width="24" height="5"/>
    <rect x="4" y="12" width="24" height="5"/>
    <rect x="4" y="20" width="24" height="5"/>
  </svg>
);

export const TemplatesIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="none" stroke="currentColor">
    {/* TEMPLATES: Duplication metaphor */}
    <rect x="4" y="4" width="18" height="18" strokeWidth="3"/>
    <rect x="10" y="10" width="18" height="18" strokeWidth="3" fill="currentColor"/>
  </svg>
);

export const SettingsIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor">
    {/* SETTINGS: Configuration metaphor */}
    <rect x="13" y="4" width="6" height="24"/>
    <rect x="4" y="13" width="24" height="6"/>
  </svg>
);

export const BlockLibraryIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor">
    {/* BLOCK LIBRARY: Grid of blocks metaphor */}
    <rect x="4" y="4" width="6" height="6"/>
    <rect x="13" y="4" width="6" height="6"/>
    <rect x="22" y="4" width="6" height="6"/>
    <rect x="4" y="13" width="6" height="6"/>
    <rect x="13" y="13" width="6" height="6"/>
    <rect x="22" y="13" width="6" height="6"/>
    <rect x="4" y="22" width="6" height="6"/>
    <rect x="13" y="22" width="6" height="6"/>
    <rect x="22" y="22" width="6" height="6"/>
  </svg>
);

export const CloseIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="none" stroke="currentColor" aria-hidden="true">
    {/* CLOSE: Two crossed bars */}
    <path d="M7 7L25 25M25 7L7 25" strokeWidth="4" strokeLinecap="square"/>
  </svg>
);

// ===== Block type icons: one grid (32), square caps, 3px strokes =====

const blockIconPaths: Record<string, ReactNode> = {
  HEADER: (
    <>
      <rect x="4" y="4" width="24" height="8" fill="currentColor" />
      <path d="M4 18H20M4 25H14" strokeWidth="3" />
    </>
  ),
  PRICES: (
    <>
      <path d="M4 7H18M4 16H18M4 25H18" strokeWidth="3" />
      <rect x="22" y="4" width="6" height="6" fill="currentColor" />
      <rect x="22" y="13" width="6" height="6" fill="currentColor" />
      <rect x="22" y="22" width="6" height="6" fill="currentColor" />
    </>
  ),
  TEXT: <path d="M4 6H28M4 13H28M4 20H28M4 27H18" strokeWidth="3" />,
  TERMS: (
    <>
      <rect x="4" y="5" width="5" height="5" fill="currentColor" />
      <rect x="4" y="14" width="5" height="5" fill="currentColor" />
      <rect x="4" y="23" width="5" height="5" fill="currentColor" />
      <path d="M13 7.5H28M13 16.5H28M13 25.5H24" strokeWidth="3" />
    </>
  ),
  FAQ: (
    <>
      <rect x="4" y="4" width="18" height="10" fill="currentColor" />
      <rect x="10" y="18" width="18" height="10" strokeWidth="3" />
    </>
  ),
  TABLE: (
    <>
      <rect x="4" y="4" width="24" height="24" strokeWidth="3" />
      <path d="M4 12H28M4 20H28M13 4V28" strokeWidth="3" />
    </>
  ),
  TIMELINE: (
    <>
      <path d="M4 16H22" strokeWidth="3" />
      <rect x="4" y="11" width="6" height="10" fill="currentColor" />
      <rect x="13" y="11" width="6" height="10" fill="currentColor" />
      <rect x="23" y="12" width="5" height="8" strokeWidth="3" />
    </>
  ),
  CONTACT: (
    <>
      <rect x="11" y="4" width="10" height="10" fill="currentColor" />
      <path d="M6 28V20H26V28" strokeWidth="3" />
    </>
  ),
  DISCOUNT: (
    <>
      <path d="M26 6L6 26" strokeWidth="3" />
      <rect x="4" y="4" width="8" height="8" fill="currentColor" />
      <rect x="20" y="20" width="8" height="8" fill="currentColor" />
    </>
  ),
  PAYMENT: (
    <>
      <rect x="4" y="7" width="24" height="18" strokeWidth="3" />
      <rect x="4" y="11" width="24" height="5" fill="currentColor" />
      <path d="M8 21H14" strokeWidth="3" />
    </>
  ),
  SIGNATURE: (
    <>
      <path d="M4 20L9 12L14 20L19 12L24 18" strokeWidth="3" strokeLinejoin="miter" />
      <path d="M4 27H28" strokeWidth="3" />
    </>
  ),
};

export const BlockTypeIcon = ({ type }: { type: string }) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeLinecap="square"
    aria-hidden="true"
  >
    {blockIconPaths[type] ?? <rect x="4" y="4" width="24" height="24" fill="currentColor" />}
  </svg>
);
