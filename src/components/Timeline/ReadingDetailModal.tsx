import React from 'react';
import { X, Trash2, Heart, Droplet, Clock, Camera, Mic, Edit3, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Reading } from '../../lib/types';
import { formatVitalDisplay } from '../../lib/thresholds';
import { useSwipeToDismiss } from '../../lib/useSwipeToDismiss';

interface ReadingDetailModalProps {
  reading: Reading | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const ReadingDetailModal: React.FC<ReadingDetailModalProps> = ({
  reading,
  onClose,
  onDelete,
}) => {
  const { handleProps, sheetStyle } = useSwipeToDismiss(onClose);

  if (!reading) return null;

  const formatted = formatVitalDisplay(reading);

  const getSourceDetails = (source: Reading['source']) => {
    switch (source) {
      case 'camera':
        return { icon: <Camera size={16} />, label: 'Optical Camera OCR' };
      case 'voice':
        return { icon: <Mic size={16} />, label: 'Web Speech Voice Input' };
      case 'manual':
        return { icon: <Edit3 size={16} />, label: 'Manual Keypad Entry' };
    }
  };

  const sourceInfo = getSourceDetails(reading.source);
  const dateObj = new Date(reading.takenAt);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" {...handleProps} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className={`vital-icon-wrap ${
                reading.type === 'bp' ? 'vital-icon-bp' : 'vital-icon-glucose'
              }`}
            >
              {reading.type === 'bp' ? <Heart size={18} /> : <Droplet size={18} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {reading.type === 'bp' ? 'Blood Pressure Record' : 'Blood Glucose Record'}
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>ID: {reading.id}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Value Card */}
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            marginBottom: '16px',
            background:
              reading.flag === 'high'
                ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(15, 23, 42, 0.9))'
                : 'rgba(15, 23, 42, 0.85)',
          }}
        >
          <div
            className={`vital-tag vital-tag-${
              reading.flag === 'high' ? 'high' : reading.flag === 'low' ? 'low' : 'normal'
            }`}
            style={{ display: 'inline-block', marginBottom: '8px' }}
          >
            {formatted.statusLabel}
          </div>

          <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }} className="tabular-nums">
            {formatted.primaryValue}{' '}
            <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>
              {formatted.unit}
            </span>
          </div>

          {formatted.secondaryValue && (
            <div style={{ fontSize: '0.85rem', color: '#a855f7', marginTop: '4px', fontWeight: 600 }}>
              Pulse Rate: {formatted.secondaryValue}
            </div>
          )}
        </div>

        {/* Metadata Breakdown */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.82rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Timestamp</div>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Input Source</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                {sourceInfo.icon}
                <span>{sourceInfo.label}</span>
              </div>
            </div>
          </div>

          {reading.notes && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                Patient Clinical Notes
              </div>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                "{reading.notes}"
              </p>
            </div>
          )}

          {reading.deviceImage && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                Captured Device Photo
              </div>
              <img
                src={reading.deviceImage}
                alt="Captured Monitor"
                style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px' }}
              />
            </div>
          )}
        </div>

        {/* Delete Action Button */}
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            onDelete(reading.id);
            onClose();
          }}
        >
          <Trash2 size={16} /> Delete Reading Record
        </button>
      </div>
    </div>
  );
};
