'use client';

import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface BlockActionRailProps {
  blockId: string;
  blockIndex: number;
  totalBlocks: number;
  isVisible: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isDragging?: boolean;
}

export const BlockActionRail: React.FC<BlockActionRailProps> = ({
  blockIndex,
  totalBlocks,
  isVisible,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isDragging = false,
}) => {
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < totalBlocks - 1;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: '0',
        top: '0',
        height: '100%',
        width: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '8px',
        gap: '4px',
        opacity: isVisible || isDragging ? 1 : 0,
        transform: isVisible || isDragging ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        pointerEvents: isVisible || isDragging ? 'auto' : 'none',
        zIndex: 10,
      }}
    >
      {/* Drag Handle */}
      <Tooltip title="Drag to reorder" placement="left">
        <Box
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            '&:hover': {
              backgroundColor: '#F5F5F5',
              borderWidth: '3px',
            },
            '&:active': {
              cursor: 'grabbing',
            },
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: '18px', color: '#000000' }} />
        </Box>
      </Tooltip>

      {/* Move Up */}
      <Tooltip title="Move up (⌘↑)" placement="left">
        <span>
          <IconButton
            onClick={onMoveUp}
            disabled={!canMoveUp}
            sx={{
              width: '32px',
              height: '32px',
              padding: 0,
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#F5F5F5',
                borderWidth: '3px',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
          >
            <KeyboardArrowUpIcon sx={{ fontSize: '18px', color: '#000000' }} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Move Down */}
      <Tooltip title="Move down (⌘↓)" placement="left">
        <span>
          <IconButton
            onClick={onMoveDown}
            disabled={!canMoveDown}
            sx={{
              width: '32px',
              height: '32px',
              padding: 0,
              backgroundColor: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#F5F5F5',
                borderWidth: '3px',
              },
              '&:disabled': {
                opacity: 0.3,
                cursor: 'not-allowed',
              },
            }}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: '18px', color: '#000000' }} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Duplicate */}
      <Tooltip title="Duplicate (⌘D)" placement="left">
        <IconButton
          onClick={onDuplicate}
          sx={{
            width: '32px',
            height: '32px',
            padding: 0,
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#F5F5F5',
              borderWidth: '3px',
            },
          }}
        >
          <ContentCopyIcon sx={{ fontSize: '16px', color: '#000000' }} />
        </IconButton>
      </Tooltip>

      {/* Delete */}
      <Tooltip title="Delete (⌘⌫)" placement="left">
        <IconButton
          onClick={onDelete}
          sx={{
            width: '32px',
            height: '32px',
            padding: 0,
            backgroundColor: '#FFFFFF',
            border: '2px solid #FF0000',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#FFF5F5',
              borderWidth: '3px',
            },
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: '16px', color: '#FF0000' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
