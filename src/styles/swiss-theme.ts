/**
 * Swiss Precision Design System
 * Monochromatic minimalism with PDF-perfect export
 */

export const swissTheme = {
  colors: {
    black: '#000000',
    white: '#FFFFFF',
    gray: '#666666',
    lightGray: '#CCCCCC',
    veryLightGray: '#F0F0F0',
    border: '#000000',
    borderLight: '#CCCCCC',
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    monoFamily: '"Courier New", Courier, monospace',

    sizes: {
      display: '32px',
      h1: '28px',
      h2: '24px',
      h3: '20px',
      h4: '18px',
      body: '14px',
      small: '13px',
      label: '11px',
      caption: '10px',
    },

    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px',
  },

  borders: {
    thin: '1px solid',
    standard: '2px solid',
    width: {
      thin: '1px',
      standard: '2px',
    },
  },

  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
} as const;

export type SwissTheme = typeof swissTheme;

// Helper function to create CSS custom properties
export function createSwissCSSVars() {
  return `
    --swiss-black: ${swissTheme.colors.black};
    --swiss-white: ${swissTheme.colors.white};
    --swiss-gray: ${swissTheme.colors.gray};
    --swiss-light-gray: ${swissTheme.colors.lightGray};
    --swiss-very-light-gray: ${swissTheme.colors.veryLightGray};

    --swiss-font-family: ${swissTheme.typography.fontFamily};
    --swiss-mono-family: ${swissTheme.typography.monoFamily};

    --spacing-xs: ${swissTheme.spacing.xs};
    --spacing-sm: ${swissTheme.spacing.sm};
    --spacing-md: ${swissTheme.spacing.md};
    --spacing-lg: ${swissTheme.spacing.lg};
    --spacing-xl: ${swissTheme.spacing.xl};
  `;
}
