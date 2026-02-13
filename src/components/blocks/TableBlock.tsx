'use client';

import { useCallback } from 'react';
import type { TableBlock as TableBlockType, SaveState } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface TableBlockProps {
  block: TableBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function TableBlock({ block, isActive }: TableBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof TableBlockType['data'], value: any) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const addColumn = () => {
    const newHeaders = [...block.data.headers, ''];
    const newRows = block.data.rows.map(row => [...row, '']);
    const newAlignment = [...block.data.alignment, 'left' as const];
    handleChange('headers', newHeaders);
    handleChange('rows', newRows);
    handleChange('alignment', newAlignment);
  };

  const removeColumn = (index: number) => {
    if (block.data.headers.length <= 1) return;
    const newHeaders = block.data.headers.filter((_, i) => i !== index);
    const newRows = block.data.rows.map(row => row.filter((_, i) => i !== index));
    const newAlignment = block.data.alignment.filter((_, i) => i !== index);
    handleChange('headers', newHeaders);
    handleChange('rows', newRows);
    handleChange('alignment', newAlignment);
  };

  const addRow = () => {
    const newRow = block.data.headers.map(() => '');
    handleChange('rows', [...block.data.rows, newRow]);
  };

  const removeRow = (index: number) => {
    handleChange('rows', block.data.rows.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...block.data.headers];
    newHeaders[index] = value;
    handleChange('headers', newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...block.data.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    handleChange('rows', newRows);
  };

  const updateAlignment = (index: number, value: 'left' | 'center' | 'right') => {
    const newAlignment = [...block.data.alignment];
    newAlignment[index] = value;
    handleChange('alignment', newAlignment);
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    border: isActive ? '4px solid #000' : '2px solid #000',
    padding: '32px',
    backgroundColor: isActive ? '#f5f5f5' : '#fff',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    borderLeft:
      accentColor !== 'transparent'
        ? `4px solid ${accentColor}`
        : isActive
        ? '4px solid #000'
        : '2px solid #000',
    animation:
      saveState === 'error'
        ? 'shake 0.3s'
        : saveState === 'saved'
        ? 'flash 0.5s'
        : 'none',
  };

  const titleInputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #000',
    padding: '8px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #000',
    padding: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: '2px solid #000',
    backgroundColor: '#fff',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginRight: '8px',
  };

  return (
    <>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
      <div style={containerStyle}>
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Table Title</label>
          <input
            type="text"
            value={block.data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            style={titleInputStyle}
            placeholder="Data Table"
          />
        </div>

        {/* Show Borders Toggle */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={block.data.showBorders}
              onChange={(e) => handleChange('showBorders', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ ...labelStyle, marginBottom: 0 }}>Show Table Borders</span>
          </label>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: block.data.showBorders ? '2px solid #000' : 'none' }}>
            {/* Headers */}
            <thead>
              <tr style={{ backgroundColor: '#000', color: '#fff' }}>
                {block.data.headers.map((header, index) => (
                  <th
                    key={index}
                    style={{
                      padding: '12px',
                      textAlign: block.data.alignment[index],
                      border: block.data.showBorders ? '1px solid #000' : 'none',
                      position: 'relative',
                    }}
                  >
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      style={{
                        ...inputStyle,
                        backgroundColor: '#000',
                        color: '#fff',
                        border: '1px solid #fff',
                        textAlign: block.data.alignment[index],
                      }}
                      placeholder={`Column ${index + 1}`}
                    />
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        onClick={() => updateAlignment(index, 'left')}
                        style={{
                          ...buttonStyle,
                          padding: '4px 8px',
                          fontSize: '10px',
                          marginRight: '2px',
                          backgroundColor: block.data.alignment[index] === 'left' ? '#fff' : '#333',
                          color: block.data.alignment[index] === 'left' ? '#000' : '#fff',
                        }}
                      >
                        L
                      </button>
                      <button
                        onClick={() => updateAlignment(index, 'center')}
                        style={{
                          ...buttonStyle,
                          padding: '4px 8px',
                          fontSize: '10px',
                          marginRight: '2px',
                          backgroundColor: block.data.alignment[index] === 'center' ? '#fff' : '#333',
                          color: block.data.alignment[index] === 'center' ? '#000' : '#fff',
                        }}
                      >
                        C
                      </button>
                      <button
                        onClick={() => updateAlignment(index, 'right')}
                        style={{
                          ...buttonStyle,
                          padding: '4px 8px',
                          fontSize: '10px',
                          marginRight: '2px',
                          backgroundColor: block.data.alignment[index] === 'right' ? '#fff' : '#333',
                          color: block.data.alignment[index] === 'right' ? '#000' : '#fff',
                        }}
                      >
                        R
                      </button>
                      {block.data.headers.length > 1 && (
                        <button
                          onClick={() => removeColumn(index)}
                          style={{
                            ...buttonStyle,
                            padding: '4px 8px',
                            fontSize: '10px',
                            backgroundColor: '#DC2626',
                            color: '#fff',
                            marginRight: 0,
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Rows */}
            <tbody>
              {block.data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#fafafa' }}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        padding: '8px',
                        border: block.data.showBorders ? '1px solid #000' : 'none',
                      }}
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        style={{
                          ...inputStyle,
                          textAlign: block.data.alignment[colIndex],
                        }}
                        placeholder="..."
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Actions */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={addRow}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            + Add Row
          </button>
          {block.data.rows.length > 0 && (
            <button
              onClick={() => removeRow(block.data.rows.length - 1)}
              style={{
                ...buttonStyle,
                backgroundColor: '#DC2626',
                color: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#991B1B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626';
              }}
            >
              - Remove Last Row
            </button>
          )}
          <button
            onClick={addColumn}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            + Add Column
          </button>
        </div>

        <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', textAlign: 'right' }}>
          {block.data.headers.length} columns × {block.data.rows.length} rows
        </div>
      </div>
    </>
  );
}
