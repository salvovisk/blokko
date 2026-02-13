'use client';

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { PaymentBlock as PaymentBlockType, SaveState, PaymentMilestone } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface PaymentBlockProps {
  block: PaymentBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function PaymentBlock({ block, isActive }: PaymentBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof PaymentBlockType['data'], value: any) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const addMilestone = () => {
    const newMilestone: PaymentMilestone = {
      id: nanoid(),
      milestone: '',
      percentage: 0,
      amount: 0,
    };
    handleChange('schedule', [...block.data.schedule, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    handleChange('schedule', block.data.schedule.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof PaymentMilestone, value: string | number) => {
    handleChange(
      'schedule',
      block.data.schedule.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const updateBankingInfo = (field: keyof PaymentBlockType['data']['bankingInfo'], value: string) => {
    handleChange('bankingInfo', { ...block.data.bankingInfo, [field]: value });
  };

  const togglePaymentMethod = (method: string) => {
    const methods = block.data.acceptedMethods;
    if (methods.includes(method)) {
      handleChange('acceptedMethods', methods.filter((m) => m !== method));
    } else {
      handleChange('acceptedMethods', [...methods, method]);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    border: isActive ? '4px solid #000' : '2px solid #000',
    padding: '32px',
    backgroundColor: isActive ? '#f5f5f5' : '#fff',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    borderLeft: accentColor !== 'transparent' ? `4px solid ${accentColor}` : isActive ? '4px solid #000' : '2px solid #000',
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

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '60px',
    border: '1px solid #000',
    padding: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    backgroundColor: '#fff',
    resize: 'vertical',
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
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Block Title</label>
        <input type="text" value={block.data.title} onChange={(e) => handleChange('title', e.target.value)} style={titleInputStyle} placeholder="Payment Terms" />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Payment Schedule</label>
        {block.data.schedule.map((milestone, index) => (
          <div key={milestone.id} style={{ padding: '16px', marginBottom: '12px', border: '2px solid #000', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Payment {index + 1}</span>
              <button onClick={() => removeMilestone(milestone.id)} style={{ ...buttonStyle, padding: '4px 12px', backgroundColor: '#000', color: '#fff' }}>
                Remove
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...labelStyle, fontSize: '10px' }}>Milestone Description</label>
              <input type="text" value={milestone.milestone} onChange={(e) => updateMilestone(milestone.id, 'milestone', e.target.value)} style={inputStyle} placeholder="Deposit (upon signing)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Percentage (%)</label>
                <input type="number" value={milestone.percentage} onChange={(e) => updateMilestone(milestone.id, 'percentage', parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="50" />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Amount (auto-calculated)</label>
                <input type="number" value={milestone.amount || 0} onChange={(e) => updateMilestone(milestone.id, 'amount', parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="0" />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addMilestone} style={buttonStyle}>
          + Add Payment
        </button>
      </div>

      <div style={{ marginBottom: '24px', padding: '16px', border: '2px solid #000', backgroundColor: '#fafafa' }}>
        <label style={labelStyle}>Banking Information</label>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ ...labelStyle, fontSize: '10px' }}>Account Name</label>
          <input type="text" value={block.data.bankingInfo.accountName} onChange={(e) => updateBankingInfo('accountName', e.target.value)} style={inputStyle} placeholder="Your Company Name" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ ...labelStyle, fontSize: '10px' }}>Account Number</label>
            <input type="text" value={block.data.bankingInfo.accountNumber} onChange={(e) => updateBankingInfo('accountNumber', e.target.value)} style={inputStyle} placeholder="XXXX-XXXX-XXXX" />
          </div>
          <div>
            <label style={{ ...labelStyle, fontSize: '10px' }}>Routing Number</label>
            <input type="text" value={block.data.bankingInfo.routingNumber} onChange={(e) => updateBankingInfo('routingNumber', e.target.value)} style={inputStyle} placeholder="XXXXXXX" />
          </div>
        </div>
        <div>
          <label style={{ ...labelStyle, fontSize: '10px' }}>SWIFT Code (Optional)</label>
          <input type="text" value={block.data.bankingInfo.swiftCode || ''} onChange={(e) => updateBankingInfo('swiftCode', e.target.value)} style={inputStyle} placeholder="XXXXXXXX" />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Accepted Payment Methods</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['Bank Transfer', 'PayPal', 'Credit Card', 'Stripe', 'Check'].map((method) => (
            <button
              key={method}
              onClick={() => togglePaymentMethod(method)}
              style={{
                ...buttonStyle,
                backgroundColor: block.data.acceptedMethods.includes(method) ? '#000' : '#fff',
                color: block.data.acceptedMethods.includes(method) ? '#fff' : '#000',
              }}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Notes</label>
        <textarea value={block.data.notes} onChange={(e) => handleChange('notes', e.target.value)} style={textareaStyle} placeholder="Payment due within 7 days..." />
      </div>
    </div>
  );
}
