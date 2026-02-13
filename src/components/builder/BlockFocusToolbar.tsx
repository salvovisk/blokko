'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { BlockType, SaveState } from '@/types/blocks';
import { formatDistanceToNow } from 'date-fns';

interface BlockFocusToolbarProps {
  blockType: BlockType;
  saveState?: SaveState;
  lastSaved?: Date;
}

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  HEADER: 'Header',
  PRICES: 'Prices',
  TEXT: 'Text',
  TERMS: 'Terms & Conditions',
};

const SAVE_STATE_CONFIG: Record<SaveState, { label: string; color: string }> = {
  idle: { label: '', color: '#000000' },
  saving: { label: 'Saving...', color: '#FFD700' },
  saved: { label: 'Saved', color: '#00DD00' },
  error: { label: 'Error saving', color: '#FF0000' },
};

export const BlockFocusToolbar: React.FC<BlockFocusToolbarProps> = ({
  blockType,
  saveState = 'idle',
  lastSaved,
}) => {
  const saveConfig = SAVE_STATE_CONFIG[saveState];
  const showSaveStatus = saveState !== 'idle';

  return (
    <Box
      sx={{
        width: '100%',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingX: '12px',
        borderBottom: '2px solid #000000',
        backgroundColor: '#FAFAFA',
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* Block Type Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: "'Courier New', Courier, monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {BLOCK_TYPE_LABELS[blockType]}
        </Typography>

        {/* Save Status */}
        {showSaveStatus && (
          <Chip
            label={saveConfig.label}
            size="small"
            sx={{
              height: '20px',
              fontSize: '10px',
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: 'bold',
              backgroundColor: '#FFFFFF',
              border: `2px solid ${saveConfig.color}`,
              color: saveConfig.color,
              '& .MuiChip-label': {
                paddingX: '8px',
              },
              animation: saveState === 'saving' ? 'pulse 1s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.6 },
              },
            }}
          />
        )}
      </Box>

      {/* Last Saved Time */}
      {lastSaved && saveState === 'idle' && (
        <Typography
          sx={{
            fontSize: '10px',
            fontFamily: "'Courier New', Courier, monospace",
            color: '#666666',
          }}
        >
          Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </Typography>
      )}

      {/* Keyboard Shortcuts Hint */}
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Typography
          sx={{
            fontSize: '10px',
            fontFamily: "'Courier New', Courier, monospace",
            color: '#999999',
          }}
        >
          ⌘D: Duplicate · ⌘⌫: Delete · ⌘K: Commands
        </Typography>
      </Box>
    </Box>
  );
};
