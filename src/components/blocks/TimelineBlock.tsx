'use client';

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { TimelineBlock as TimelineBlockType, SaveState, TimelineMilestone } from '@/types/blocks';
import { useBuilderStore } from '@/stores/builder-store';

interface TimelineBlockProps {
  block: TimelineBlockType;
  isActive: boolean;
}

const SAVE_STATE_COLORS: Record<SaveState, string> = {
  idle: 'transparent',
  saving: '#FFD700',
  saved: '#00DD00',
  error: '#FF0000',
};

export default function TimelineBlock({ block, isActive }: TimelineBlockProps) {
  const updateBlockWithAutoSave = useBuilderStore((state) => state.updateBlockWithAutoSave);
  const saveState = block.saveState || 'idle';
  const accentColor = SAVE_STATE_COLORS[saveState];

  const handleChange = useCallback(
    (field: keyof TimelineBlockType['data'], value: any) => {
      updateBlockWithAutoSave(block.id, { [field]: value });
    },
    [block.id, updateBlockWithAutoSave]
  );

  const addMilestone = () => {
    const newMilestone: TimelineMilestone = {
      id: nanoid(),
      phase: '',
      duration: '',
      deliverables: '',
      dueDate: '',
    };
    handleChange('milestones', [...block.data.milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    handleChange('milestones', block.data.milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof TimelineMilestone, value: string) => {
    handleChange(
      'milestones',
      block.data.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
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
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Timeline Title</label>
        <input
          type="text"
          value={block.data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          style={titleInputStyle}
          placeholder="Project Timeline"
        />
      </div>

      {/* Start Date */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Start Date</label>
        <input
          type="text"
          value={block.data.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          style={inputStyle}
          placeholder="Upon approval"
        />
      </div>

      {/* Milestones */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Milestones</label>
        {block.data.milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            style={{
              padding: '16px',
              marginBottom: '12px',
              border: '2px solid #000',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Phase {index + 1}</span>
              <button
                onClick={() => removeMilestone(milestone.id)}
                style={{
                  ...buttonStyle,
                  padding: '4px 12px',
                  backgroundColor: '#000',
                  color: '#fff',
                }}
              >
                Remove
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...labelStyle, fontSize: '10px' }}>Phase Name</label>
              <input
                type="text"
                value={milestone.phase}
                onChange={(e) => updateMilestone(milestone.id, 'phase', e.target.value)}
                style={inputStyle}
                placeholder="Discovery & Planning"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Duration</label>
                <input
                  type="text"
                  value={milestone.duration}
                  onChange={(e) => updateMilestone(milestone.id, 'duration', e.target.value)}
                  style={inputStyle}
                  placeholder="2 weeks"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '10px' }}>Due Date (Optional)</label>
                <input
                  type="text"
                  value={milestone.dueDate || ''}
                  onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                  style={inputStyle}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, fontSize: '10px' }}>Deliverables</label>
              <textarea
                value={milestone.deliverables}
                onChange={(e) => updateMilestone(milestone.id, 'deliverables', e.target.value)}
                style={textareaStyle}
                placeholder="Wireframes, project plan..."
              />
            </div>
          </div>
        ))}

        <button onClick={addMilestone} style={buttonStyle}>
          + Add Milestone
        </button>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={block.data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          style={textareaStyle}
          placeholder="Timeline assumes timely client feedback..."
        />
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', textAlign: 'right' }}>
        {block.data.milestones.length} milestone{block.data.milestones.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
