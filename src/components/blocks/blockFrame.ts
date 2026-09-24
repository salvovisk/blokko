import type { SaveState } from '@/types/blocks';
import { swissTheme } from '@/styles/swiss-theme';

const { colors } = swissTheme;

/**
 * Block frame border. Save state is carried by line style and weight,
 * never by hue: dashed while saving, solid when saved, red only on error.
 */
export function blockFrameBorder(saveState: SaveState, isActive: boolean): string {
  const width = isActive ? '4px' : '2px';
  if (saveState === 'error') return `4px solid ${colors.error}`;
  if (saveState === 'saving') return `${width} dashed ${colors.black}`;
  return `${width} solid ${colors.black}`;
}
