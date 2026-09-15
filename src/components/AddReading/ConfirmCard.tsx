import React, { useState } from 'react';
import { Check, RotateCcw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { Reading, ReadingType, ReadingSource, ExtractionResult } from '../../lib/types';
import { computeFlag } from '../../lib/thresholds';

interface ConfirmCardProps {
  initialData: ExtractionResult;
  source: ReadingSource;
  previewImage?: string;
  onSave: (reading: Omit<Reading, 'id' | 'createdAt' | 'flag'>) => void;
  onCancel: () => void;
}

export const ConfirmCard: React.FC<ConfirmCardProps> = ({
  initialData,
  source,
  previewImage,
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState<ReadingType>(
    initialData.type === 'unknown' ? 'bp' : initialData.type
  );
  const [systolic, setSystolic] = useState<number | ''>(
    initialData.systolic !== null ? initialData.systolic : 120
  );
  const [diastolic, setDiastolic] = useState<number | ''>(
    initialData.diastolic !== null ? initialData.diastolic : 80
  );
  const [pulse, setPulse] = useState<number | ''>(
    initialData.pulse !== null ? initialData.pulse : 72
  );
  const [glucose, setGlucose] = useState<number | ''>(
    initialData.glucose !== null ? initialData.glucose : 110
  );
  const [notes, setNotes] = useState('');

  // Live threshold check preview
  const liveFlag = computeFlag(type, {
    systolic: typeof systolic === 'number' ? systolic : undefined,
    diastolic: typeof diastolic === 'number' ? diastolic : undefined,
    glucose: typeof glucose === 'number' ? glucose : undefined,
  });

  const handleSave = () => {
    if (type === 'bp') {
      if (!systolic || !diastolic) return;
      onSave({
        userId: 'usr_vmed_2026',
        type: 'bp',
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : undefined,
        source,
        takenAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        deviceImage: previewImage,
      });
    } else {
      if (!glucose) return;
      onSave({
        userId: 'usr_vmed_2026',
        type: 'glucose',
        glucose: Number(glucose),
        source,
        takenAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        deviceImage: previewImage,
      });
    }
  };

  return (
    <div className="glass-card glass-card-elevated" style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Confirm AI Extraction</h3>
        </div>

        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '9999px',
            background:
              initialData.confidence === 'high'
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(245, 158, 11, 0.2)',
            color: initialData.confidence === 'high' ? '#34d399' : '#fbbf24',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {initialData.confidenceScore}% Confidence
        </div>
      </div>

      {previewImage && (
        <div style={{ marginBottom: '14px', borderRadius: '10px', overflow: 'hidden', maxHeight: '140px' }}>
          <img
            src={previewImage}
            alt="Device Monitor Capture"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Type Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          className={`filter-chip ${type === 'bp' ? 'active' : ''}`}
          onClick={() => setType('bp')}
          style={{ flex: 1, textAlign: 'center' }}
        >
          Blood Pressure
        </button>
        <button
          type="button"
          className={`filter-chip ${type === 'glucose' ? 'active' : ''}`}
          onClick={() => setType('glucose')}
          style={{ flex: 1, textAlign: 'center' }}
        >
          Blood Glucose
        </button>
      </div>

      {type === 'bp' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Systolic</label>
            <input
              type="number"
              min={40}
              max={300}
              className="form-input tabular-nums"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="120"
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Diastolic</label>
            <input
              type="number"
              min={20}
              max={200}
              className="form-input tabular-nums"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="80"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pulse (bpm)</label>
            <input
              type="number"
              min={20}
              max={250}
              className="form-input tabular-nums"
              value={pulse}
              onChange={(e) => setPulse(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="72"
            />
          </div>
        </div>
      ) : (
        <div className="form-group">
          <label className="form-label">Blood Glucose (mg/dL)</label>
          <input
            type="number"
            min={10}
            max={1000}
            className="form-input tabular-nums"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value ? parseInt(e.target.value, 10) : '')}
            placeholder="110"
            autoFocus
          />
        </div>
      )}

      {/* Threshold Flag Warning Pill */}
      {liveFlag && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background: liveFlag === 'high' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${liveFlag === 'high' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: liveFlag === 'high' ? '#fda4af' : '#fde68a',
            marginBottom: '12px',
          }}
        >
          <AlertTriangle size={15} />
          <span>
            {liveFlag === 'high'
              ? 'Warning: Values exceed normal clinical threshold.'
              : 'Caution: Values below typical physiological floor.'}
          </span>
        </div>
      )}

      {/* Optional Clinical Note */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">Notes / Context (Optional)</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. 1 hr post breakfast, slight fatigue..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ flex: 1 }}
        >
          <RotateCcw size={16} /> Retake
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          style={{ flex: 2 }}
        >
          <Check size={18} /> Confirm & Save
        </button>
      </div>
    </div>
  );
};
