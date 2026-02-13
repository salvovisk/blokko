// Responsive breakpoints for the application
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

// Media query helpers
export const media = {
  mobile: `@media (max-width: ${breakpoints.mobile - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.tablet}px)`,

  // Convenience helpers
  upToTablet: `@media (max-width: ${breakpoints.tablet - 1}px)`,
  fromTablet: `@media (min-width: ${breakpoints.mobile}px)`,
  fromDesktop: `@media (min-width: ${breakpoints.tablet}px)`,
} as const;

// Hook for detecting screen size
export const useMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia(query);
  const [matches, setMatches] = React.useState(mediaQuery.matches);

  React.useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);

  return matches;
};

// React import for the hook
import React from 'react';
