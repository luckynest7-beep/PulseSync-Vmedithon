import React, { useState } from 'react';
import { Camera, Mic, Edit3, X } from 'lucide-react';
import { Reading, ReadingSource } from '../../lib/types';
import { CameraCapture } from './CameraCapture';
import { VoiceInput } from './VoiceInput';
import { ManualInput } from './ManualInput';

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReading: (reading: Omit<Reading, 'id' | 'createdAt' | 'flag'>) => void;
}

export const AddReadingModal: React.FC<AddReadingModalProps> = ({
  isOpen,
  onClose,
  onSaveReading,
}) => {
  const [activeTab, setActiveTab] = useState<ReadingSource>('camera');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Capture Vital Reading
          </h2>
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

        {/* Tab Switcher: Camera / Voice / Manual */}
        <div className="modal-tab-bar">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            <Camera size={18} />
            <span>Camera</span>
          </button>

          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            <Mic size={18} />
            <span>Voice</span>
          </button>

          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Edit3 size={18} />
            <span>Manual</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'camera' && (
          <CameraCapture onSaveReading={onSaveReading} onCancel={onClose} />
        )}
        {activeTab === 'voice' && (
          <VoiceInput onSaveReading={onSaveReading} onCancel={onClose} />
        )}
        {activeTab === 'manual' && (
          <ManualInput onSaveReading={onSaveReading} onCancel={onClose} />
        )}
      </div>
    </div>
  );
};
