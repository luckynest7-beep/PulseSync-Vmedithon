import React, { useState } from 'react';
import { Edit3, Check, Heart, Droplet } from 'lucide-react';
import { Reading, ReadingType } from '../../lib/types';
import { computeFlag } from '../../lib/thresholds';

interface ManualInputProps {
  onSaveReading: (reading: Omit<Reading, 'id' | 'createdAt' | 'flag'>) => void;
  onCancel: () => void;
}

export const ManualInput: React.FC<ManualInputProps> = ({ onSaveReading, onCancel }) => {
  const [type, setType] = useState<ReadingType>('bp');
  const [systolic, setSystolic] = useState<number | ''>(125);
  const [diastolic, setDiastolic] = useState<number | ''>(82);
  const [pulse, setPulse] = useState<number | ''>(74);
  const [glucose, setGlucose] = useState<number | ''>(115);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (type === 'bp') {
      if (!systolic || !diastolic) return;
      onSaveReading({
        userId: 'usr_vmed_2026',
        type: 'bp',
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : undefined,
        source: 'manual',
        takenAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
      });
    } else {
      if (!glucose) return;
      onSaveReading({
        userId: 'usr_vmed_2026',
        type: 'glucose',
        glucose: Number(glucose),
        source: 'manual',
        takenAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
      });
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      {/* Type Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <button
          type="button"
          className={`filter-chip ${type === 'bp' ? 'active' : ''}`}
          onClick={() => setType('bp')}
          style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Heart size={14} color={type === 'bp' ? '#f43f5e' : '#94a3b8'} />
          Blood Pressure
        </button>
        <button
          type="button"
          className={`filter-chip ${type === 'glucose' ? 'active' : ''}`}
          onClick={() => setType('glucose')}
          style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Droplet size={14} color={type === 'glucose' ? '#06b6d4' : '#94a3b8'} />
          Blood Glucose
        </button>
      </div>

      {type === 'bp' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Systolic (mmHg)</label>
              <input
                type="number"
                className="form-input tabular-nums"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="120"
                min={60}
                max={260}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Diastolic (mmHg)</label>
              <input
                type="number"
                className="form-input tabular-nums"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="80"
                min={40}
                max={160}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pulse (bpm - Optional)</label>
            <input
              type="number"
              className="form-input tabular-nums"
              value={pulse}
              onChange={(e) => setPulse(e.target.value ? parseInt(e.target.value, 10) : '')}
              placeholder="72"
              min={40}
              max={220}
            />
          </div>
        </>
      ) : (
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Blood Glucose Level (mg/dL)</label>
          <input
            type="number"
            className="form-input tabular-nums"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value ? parseInt(e.target.value, 10) : '')}
            placeholder="110"
            min={20}
            max={600}
          />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Notes (Optional)</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Morning fasting, post exercise..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ flex: 1 }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          style={{ flex: 2 }}
        >
          <Check size={18} /> Save Manual Reading
        </button>
      </div>
    </div>
  );
};
