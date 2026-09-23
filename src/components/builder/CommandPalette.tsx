'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Modal, TextField, Typography, List, ListItem, ListItemButton } from '@mui/material';
import { BlockType } from '@/types/blocks';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Command {
  id: string;
  label: string;
  category: string;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, commands }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesLabel = cmd.label.toLowerCase().includes(searchLower);
    const matchesKeywords = cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchLower));
    const matchesCategory = cmd.category.toLowerCase().includes(searchLower);
    return matchesLabel || matchesKeywords || matchesCategory;
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedIndex];
        if (selectedCommand) {
          selectedCommand.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredCommands, selectedIndex, onClose]);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
      }}
    >
      <Box
        sx={{
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '60vh',
          backgroundColor: '#FFFFFF',
          border: '4px solid #000000',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.35)',
          fontFamily: "'Courier New', Courier, monospace",
        }}
      >
        {/* Search Input */}
        <Box sx={{ padding: '16px', borderBottom: '2px solid #000000' }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder={t.builder.palette.placeholder}
            inputProps={{ 'aria-label': t.builder.palette.placeholder }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '16px',
                fontWeight: 'bold',
              },
            }}
          />
        </Box>

        {/* Commands List */}
        <Box
          sx={{
            maxHeight: 'calc(60vh - 80px)',
            overflowY: 'auto',
          }}
        >
          {filteredCommands.length === 0 ? (
            <Box sx={{ padding: '32px', textAlign: 'center' }}>
              <Typography
                sx={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '14px',
                  color: '#666666',
                }}
              >
                {t.builder.palette.noResults}
              </Typography>
            </Box>
          ) : (
            <List sx={{ padding: 0 }}>
              {Object.entries(groupedCommands).map(([category, cmds], categoryIndex) => (
                <Box key={category}>
                  {/* Category Header */}
                  {categoryIndex > 0 && (
                    <Box sx={{ height: '1px', backgroundColor: '#CCCCCC', marginX: '16px' }} />
                  )}
                  <Box sx={{ paddingX: '16px', paddingY: '8px', backgroundColor: '#F0F0F0' }}>
                    <Typography
                      sx={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#666666',
                      }}
                    >
                      {category}
                    </Typography>
                  </Box>

                  {/* Commands */}
                  {cmds.map((cmd, cmdIndex) => {
                    const globalIndex = filteredCommands.findIndex((c) => c.id === cmd.id);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <ListItem key={cmd.id} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          sx={{
                            paddingX: '16px',
                            paddingY: '12px',
                            backgroundColor: isSelected ? '#000000' : 'transparent',
                            color: isSelected ? '#FFFFFF' : '#000000',
                            '& .MuiTypography-root': { color: isSelected ? '#FFFFFF' : undefined },
                            '&:hover': {
                              backgroundColor: isSelected ? '#000000' : '#F0F0F0',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'Courier New', Courier, monospace",
                                fontSize: '14px',
                                fontWeight: isSelected ? 'bold' : 'normal',
                              }}
                            >
                              {cmd.label}
                            </Typography>
                            {cmd.shortcut && (
                              <Typography
                                sx={{
                                  fontFamily: "'Courier New', Courier, monospace",
                                  fontSize: '12px',
                                  color: '#666666',
                                }}
                              >
                                {cmd.shortcut}
                              </Typography>
                            )}
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </Box>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            padding: '8px 16px',
            borderTop: '2px solid #000000',
            backgroundColor: '#F0F0F0',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '10px',
              color: '#666666',
            }}
          >
            {t.builder.palette.footer}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '10px',
              color: '#666666',
            }}
          >
            {t.builder.palette.count.replace('{count}', String(filteredCommands.length))}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};
