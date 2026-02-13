'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Template } from '@/types/blocks';
import { useLanguage } from '@/contexts/LanguageContext';

interface TemplatesTableProps {
  templates: Template[];
  onUse: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

type SortColumn = 'name' | 'isSystem' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export default function TemplatesTable({ templates, onUse, onRename, onDelete }: TemplatesTableProps) {
  const { t } = useLanguage();
  const [sortColumn, setSortColumn] = useState<SortColumn>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Helper to get localized description
  const getDescription = (template: Template): string => {
    const descriptionKey = template.id as keyof typeof t.dashboard.templateDescriptions;
    return t.dashboard.templateDescriptions[descriptionKey] || template.description || '';
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort templates
  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      let aVal: string | number | boolean = '';
      let bVal: string | number | boolean = '';

      if (sortColumn === 'updatedAt') {
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
      } else if (sortColumn === 'isSystem') {
        aVal = a.isSystem ? 1 : 0;
        bVal = b.isSystem ? 1 : 0;
      } else {
        aVal = (a[sortColumn] || '').toString().toLowerCase();
        bVal = (b[sortColumn] || '').toString().toLowerCase();
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [templates, sortColumn, sortDirection]);

  // Render sort arrow
  const renderSortArrow = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return (
      <span style={{ marginLeft: '8px' }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Start rename
  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  // Save rename
  const saveRename = (id: string) => {
    if (renameValue.trim() && renameValue !== templates.find((t) => t.id === id)?.name) {
      onRename(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  // Cancel rename
  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  if (templates.length === 0) {
    return (
      <div style={{ border: '3px dashed #CCC', padding: '60px', textAlign: 'center', background: '#FAFAFA' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <p style={{ fontSize: '16px', color: '#666' }}>
          No templates yet. Save your first quote as a template.
        </p>
      </div>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedTemplates.map((template) => (
          <div
            key={template.id}
            style={{
              border: '3px solid #000',
              background: '#FFF',
              padding: '16px',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              {renamingId === template.id ? (
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename(template.id);
                    if (e.key === 'Escape') cancelRename();
                  }}
                  onBlur={() => saveRename(template.id)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #10B981',
                    fontSize: '16px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {template.name}
                </div>
              )}
              {getDescription(template) && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  {getDescription(template)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  border: `2px solid ${template.isSystem ? '#2563EB' : '#666'}`,
                  background: template.isSystem ? '#EFF6FF' : '#F5F5F5',
                  color: template.isSystem ? '#2563EB' : '#666',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {template.isSystem ? t.dashboard.templates.type.system : t.dashboard.templates.type.mine} • {template.blocks.length} {t.dashboard.templates.table.blocks}
              </span>
              <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {new Date(template.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onUse(template.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10B981',
                  border: '2px solid #10B981',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.background = '#059669';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.background = '#10B981';
                }}
              >
                {t.dashboard.templates.actions.use}
              </button>
              {template.isOwner && (
                <>
                  <button
                    onClick={() => startRename(template.id, template.name)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#FFF',
                      border: '2px solid #000',
                      color: '#000',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = '#000';
                      e.currentTarget.style.color = '#FFF';
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = '#FFF';
                      e.currentTarget.style.color = '#000';
                    }}
                  >
                    {t.dashboard.templates.actions.rename}
                  </button>
                  <button
                    onClick={() => onDelete(template.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#FFF',
                      border: '2px solid #DC2626',
                      color: '#DC2626',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.background = '#DC2626';
                      e.currentTarget.style.color = '#FFF';
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.background = '#FFF';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                  >
                    {t.dashboard.templates.actions.delete}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div style={{ border: '3px solid #000', background: '#FFF', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#000', color: '#FFF' }}>
            <th
              onClick={() => handleSort('name')}
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'sticky',
                top: 0,
                background: '#000',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
              }}
            >
              {t.dashboard.templates.table.name} {renderSortArrow('name')}
            </th>
            <th
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                position: 'sticky',
                top: 0,
                background: '#000',
                width: '120px',
              }}
            >
              {t.dashboard.templates.table.blocks}
            </th>
            <th
              onClick={() => handleSort('isSystem')}
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'sticky',
                top: 0,
                background: '#000',
                width: '120px',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
              }}
            >
              {t.dashboard.templates.table.type} {renderSortArrow('isSystem')}
            </th>
            <th
              onClick={() => handleSort('updatedAt')}
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'sticky',
                top: 0,
                background: '#000',
                width: '180px',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
              }}
            >
              {t.dashboard.templates.table.updated} {renderSortArrow('updatedAt')}
            </th>
            <th
              style={{
                padding: '16px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                position: 'sticky',
                top: 0,
                background: '#000',
                width: '280px',
              }}
            >
              {t.dashboard.templates.table.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTemplates.map((template) => (
            <tr
              key={template.id}
              onMouseEnter={() => setHoveredRow(template.id)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                background: hoveredRow === template.id ? '#FAFAFA' : '#FFF',
                borderTop: '2px solid #EEE',
                transition: 'background 0.15s ease-in-out',
              }}
            >
              <td style={{ padding: '16px' }}>
                {renamingId === template.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(template.id);
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onBlur={() => saveRename(template.id)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #10B981',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                    }}
                  />
                ) : (
                  <>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                      {template.name}
                    </div>
                    {getDescription(template) && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '400px',
                        }}
                      >
                        {getDescription(template)}
                      </div>
                    )}
                  </>
                )}
              </td>
              <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                {template.blocks.length}
              </td>
              <td style={{ padding: '16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    border: `2px solid ${template.isSystem ? '#2563EB' : '#666'}`,
                    background: template.isSystem ? '#EFF6FF' : '#F5F5F5',
                    color: template.isSystem ? '#2563EB' : '#666',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {template.isSystem ? t.dashboard.templates.type.system : t.dashboard.templates.type.mine}
                </span>
              </td>
              <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                {new Date(template.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td style={{ padding: '16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onUse(template.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#10B981',
                      border: '2px solid #10B981',
                      color: '#FFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#059669';
                      e.currentTarget.style.borderColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#10B981';
                      e.currentTarget.style.borderColor = '#10B981';
                    }}
                  >
                    {t.dashboard.templates.actions.use}
                  </button>
                  {template.isOwner && (
                    <>
                      <button
                        onClick={() => startRename(template.id, template.name)}
                        style={{
                          padding: '8px 16px',
                          background: '#FFF',
                          border: '2px solid #000',
                          color: '#000',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#000';
                          e.currentTarget.style.color = '#FFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFF';
                          e.currentTarget.style.color = '#000';
                        }}
                      >
                        {t.dashboard.templates.actions.rename}
                      </button>
                      <button
                        onClick={() => onDelete(template.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#FFF',
                          border: '2px solid #DC2626',
                          color: '#DC2626',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#DC2626';
                          e.currentTarget.style.color = '#FFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFF';
                          e.currentTarget.style.color = '#DC2626';
                        }}
                      >
                        {t.dashboard.templates.actions.delete}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
