'use client';

import { useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type { PricesBlock as PricesBlockType, PriceItem } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';
import { blockFrameBorder } from './blockFrame';

/** Round to whole cents so line totals, tax and grand total always add up. */
export const toCents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Money inputs: empty or junk becomes 0, negatives are not allowed. */
const parseAmount = (raw: string) => Math.max(0, parseFloat(raw) || 0);

export function computeTotals(items: PriceItem[], taxRate: number, showTax: boolean) {
  const subtotal = toCents(items.reduce((sum, item) => sum + item.total, 0));
  const tax = toCents(subtotal * (taxRate / 100));
  const total = toCents(subtotal + (showTax ? tax : 0));
  return { subtotal, tax, total };
}

interface PricesBlockProps {
  block: PricesBlockType;
  isActive: boolean;
}


export default function PricesBlock({ block, isActive }: PricesBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';

  const handleItemChange = useCallback(
    (itemId: string, field: keyof PriceItem, value: string | number) => {
      const updatedItems = block.data.items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          // Auto-calculate total
          if (field === 'quantity' || field === 'price') {
            updated.total = toCents(updated.quantity * updated.price);
          }
          return updated;
        }
        return item;
      });

      updateBlockWithAutoSave(block.id, {
        items: updatedItems,
        ...computeTotals(updatedItems, block.data.taxRate, block.data.showTax),
      });
    },
    [block.id, block.data.items, block.data.taxRate, block.data.showTax, updateBlockWithAutoSave]
  );

  const addRow = useCallback(() => {
    const newItem: PriceItem = {
      id: nanoid(),
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
    };

    updateBlockWithAutoSave(block.id, {
      items: [...block.data.items, newItem],
    });
  }, [block.id, block.data.items, updateBlockWithAutoSave]);

  const removeRow = useCallback(
    (itemId: string) => {
      const updatedItems = block.data.items.filter((item) => item.id !== itemId);
      updateBlockWithAutoSave(block.id, {
        items: updatedItems,
        ...computeTotals(updatedItems, block.data.taxRate, block.data.showTax),
      });
    },
    [block.id, block.data.items, block.data.taxRate, block.data.showTax, updateBlockWithAutoSave]
  );

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      updateBlockWithAutoSave(block.id, { currency });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const handleTaxRateChange = useCallback(
    (taxRate: number) => {
      updateBlockWithAutoSave(block.id, {
        taxRate,
        ...computeTotals(block.data.items, taxRate, block.data.showTax),
      });
    },
    [block.id, block.data.items, block.data.showTax, updateBlockWithAutoSave]
  );

  const toggleShowTax = useCallback(() => {
    const showTax = !block.data.showTax;
    updateBlockWithAutoSave(block.id, {
      showTax,
      ...computeTotals(block.data.items, block.data.taxRate, showTax),
    });
  }, [block.id, block.data.items, block.data.taxRate, block.data.showTax, updateBlockWithAutoSave]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    border: blockFrameBorder(saveState, isActive),
    padding: '32px',
    backgroundColor: isActive ? '#f5f5f5' : '#fff',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    animation: saveState === 'error' ? 'shake 0.3s' : saveState === 'saved' ? 'flash 0.5s' : 'none',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '16px',
    borderBottom: '2px solid #000',
    paddingBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  };

  const thStyle: React.CSSProperties = {
    border: '2px solid #000',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    backgroundColor: '#000',
    color: '#fff',
  };

  const tdStyle: React.CSSProperties = {
    border: '1px solid #000',
    padding: '8px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    padding: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
  };

  const buttonStyle: React.CSSProperties = {
    border: '2px solid #000',
    padding: '8px 16px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.1s ease',
  };

  const removeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    padding: '4px 8px',
    fontSize: '11px',
    backgroundColor: '#000',
    color: '#fff',
  };

  const totalsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '2px solid #000',
  };

  const totalRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '300px',
    gap: '16px',
    fontSize: '14px',
    fontFamily: 'monospace',
  };

  const grandTotalStyle: React.CSSProperties = {
    ...totalRowStyle,
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '12px',
    border: '2px solid #000',
    backgroundColor: '#000',
    color: '#fff',
  };

  const currencySymbol = block.data.currency === 'EUR' ? '€' : '$';

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
      <div className="quote-block" style={containerStyle}>
      <div style={titleStyle}>
        <span>PRICE TABLE</span>
        <select
          value={block.data.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          style={{ ...buttonStyle, padding: '4px 8px' }}
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '50%' }}>Description</th>
            <th style={{ ...thStyle, width: '15%' }}>Quantity</th>
            <th style={{ ...thStyle, width: '15%' }}>Price</th>
            <th style={{ ...thStyle, width: '15%' }}>Total</th>
            <th style={{ ...thStyle, width: '5%' }}></th>
          </tr>
        </thead>
        <tbody>
          {block.data.items.length === 0 && (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#666' }}>
                No items yet. Click "Add Row" to start.
              </td>
            </tr>
          )}
          {block.data.items.map((item) => (
            <tr key={item.id}>
              <td style={tdStyle}>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  style={inputStyle}
                  placeholder="Item description"
                  aria-label="Item description"
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', parseAmount(e.target.value))}
                  aria-label="Quantity"
                  style={inputStyle}
                  min="0"
                  step="0.5"
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(item.id, 'price', parseAmount(e.target.value))}
                  aria-label="Unit price"
                  style={inputStyle}
                  min="0"
                  step="0.01"
                />
              </td>
              <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                {currencySymbol}{item.total.toFixed(2)}
              </td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => removeRow(item.id)}
                  style={removeButtonStyle}
                  title="Remove row"
                  aria-label="Remove row"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>

      <button onClick={addRow} style={buttonStyle}>
        + Add Row
      </button>

      {/* Tax Controls */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <input
            type="checkbox"
            checked={block.data.showTax}
            onChange={toggleShowTax}
            style={{ width: '16px', height: '16px' }}
          />
          Show Tax
        </label>
        {block.data.showTax && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            Tax Rate (%):
            <input
              type="number"
              value={block.data.taxRate}
              onChange={(e) => handleTaxRateChange(Math.min(100, parseAmount(e.target.value)))}
              style={{ ...inputStyle, width: '60px', border: '1px solid #000', padding: '4px' }}
              min="0"
              max="100"
              step="0.5"
            />
          </label>
        )}
      </div>

      {/* Totals */}
      <div style={totalsStyle}>
        <div style={totalRowStyle}>
          <span>SUBTOTAL:</span>
          <span style={{ fontWeight: 'bold' }}>
            {currencySymbol}{block.data.subtotal.toFixed(2)}
          </span>
        </div>

        {block.data.showTax && (
          <div style={totalRowStyle}>
            <span>TAX ({block.data.taxRate}%):</span>
            <span style={{ fontWeight: 'bold' }}>
              {currencySymbol}{block.data.tax.toFixed(2)}
            </span>
          </div>
        )}

        <div style={grandTotalStyle}>
          <span>TOTAL:</span>
          <span>{currencySymbol}{block.data.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    </>
  );
}
