'use client';

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { ContactBlock as ContactBlockType, SaveState, ContactPerson } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface ContactBlockProps {
  block: ContactBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function ContactBlock({ block, isActive }: ContactBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof ContactBlockType['data'], value: any) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const addContact = () => {
    const newContact: ContactPerson = {
      id: nanoid(),
      name: '',
      role: '',
      email: '',
      phone: '',
      bio: '',
    };
    handleChange('contacts', [...block.data.contacts, newContact]);
  };

  const removeContact = (id: string) => {
    handleChange('contacts', block.data.contacts.filter((c) => c.id !== id));
  };

  const updateContact = (id: string, field: keyof ContactPerson, value: string) => {
    handleChange(
      'contacts',
      block.data.contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
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
        <input
          type="text"
          value={block.data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          style={titleInputStyle}
          placeholder="Your Team"
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Layout</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleChange('layout', 'list')}
            style={{
              ...buttonStyle,
              backgroundColor: block.data.layout === 'list' ? '#000' : '#fff',
              color: block.data.layout === 'list' ? '#fff' : '#000',
            }}
          >
            List
          </button>
          <button
            onClick={() => handleChange('layout', 'grid')}
            style={{
              ...buttonStyle,
              backgroundColor: block.data.layout === 'grid' ? '#000' : '#fff',
              color: block.data.layout === 'grid' ? '#fff' : '#000',
            }}
          >
            Grid
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Contacts</label>
        {block.data.contacts.map((contact, index) => (
          <div key={contact.id} style={{ padding: '16px', marginBottom: '12px', border: '2px solid #000', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Contact {index + 1}</span>
              <button onClick={() => removeContact(contact.id)} style={{ ...buttonStyle, padding: '4px 12px', backgroundColor: '#000', color: '#fff' }}>
                Remove
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Name</label>
                <input type="text" value={contact.name} onChange={(e) => updateContact(contact.id, 'name', e.target.value)} style={inputStyle} placeholder="John Doe" />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Role</label>
                <input type="text" value={contact.role} onChange={(e) => updateContact(contact.id, 'role', e.target.value)} style={inputStyle} placeholder="Project Manager" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Email</label>
                <input type="email" value={contact.email} onChange={(e) => updateContact(contact.id, 'email', e.target.value)} style={inputStyle} placeholder="john@company.com" />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Phone (Optional)</label>
                <input type="tel" value={contact.phone || ''} onChange={(e) => updateContact(contact.id, 'phone', e.target.value)} style={inputStyle} placeholder="+1 234 567 8900" />
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, fontSize: '10px' }}>Bio (Optional)</label>
              <textarea value={contact.bio || ''} onChange={(e) => updateContact(contact.id, 'bio', e.target.value)} style={textareaStyle} placeholder="Short bio..." />
            </div>
          </div>
        ))}

        <button onClick={addContact} style={buttonStyle}>
          + Add Contact
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', textAlign: 'right' }}>
        {block.data.contacts.length} contact{block.data.contacts.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
