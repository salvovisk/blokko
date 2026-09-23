'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { BlockType, SaveState } from '@/types/blocks';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModifierKey } from '@/hooks/useModifierKey';
import { swissTheme } from '@/styles/swiss-theme';

interface BlockFocusToolbarProps {
  blockType: BlockType;
  saveState?: SaveState;
  lastSaved?: Date;
}

const { colors } = swissTheme;
const MONO = "'Courier New', Courier, monospace";

// Save state reads by line style, matching the block frame: dashed = saving,
// solid = saved, red = error.
const SAVE_STATE_BORDER: Record<Exclude<SaveState, 'idle'>, string> = {
  saving: `2px dashed ${colors.black}`,
  saved: `2px solid ${colors.black}`,
  error: `2px solid ${colors.error}`,
};

export const BlockFocusToolbar: React.FC<BlockFocusToolbarProps> = ({
  blockType,
  saveState = 'idle',
  lastSaved,
}) => {
  const { t, locale } = useLanguage();
  const mod = useModifierKey();
  const blockLabels = t.builder.sidebar.blocks as Record<string, { label: string }>;
  const shortcuts = t.builder.shortcuts;

  const hint = [
    `${mod}D ${shortcuts.duplicate}`,
    `${mod}⌫ ${shortcuts.delete}`,
    `${mod}Z ${shortcuts.undo}`,
    `${mod}K ${shortcuts.commands}`,
  ].join(' · ');

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        paddingX: '12px',
        borderBottom: `2px solid ${colors.black}`,
        backgroundColor: colors.veryLightGray,
        fontFamily: MONO,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: MONO,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {blockLabels[blockType.toLowerCase()]?.label ?? blockType}
        </Typography>

        <Box role="status" aria-live="polite" sx={{ display: 'flex' }}>
          {saveState !== 'idle' && (
            <Box
              component="span"
              sx={{
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                paddingX: '8px',
                fontSize: '10px',
                fontFamily: MONO,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                backgroundColor: colors.white,
                border: SAVE_STATE_BORDER[saveState],
                color: saveState === 'error' ? colors.error : colors.black,
              }}
            >
              {t.builder.saveState[saveState]}
            </Box>
          )}
        </Box>
      </Box>

      {lastSaved && saveState === 'idle' && (
        <Typography sx={{ fontSize: '10px', fontFamily: MONO, color: colors.gray }}>
          {t.builder.saveState.savedAgo.replace(
            '{time}',
            formatDistanceToNow(lastSaved, { addSuffix: true, locale: locale === 'it' ? itLocale : undefined })
          )}
        </Typography>
      )}

      <Typography
        sx={{
          fontSize: '10px',
          fontFamily: MONO,
          color: colors.gray,
          display: { xs: 'none', md: 'block' },
        }}
      >
        {hint}
      </Typography>
    </Box>
  );
};
