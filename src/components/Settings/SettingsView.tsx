import React, { useState } from 'react';
import { User, Shield, RotateCcw, Trash2, Check, Bell, Sparkles } from 'lucide-react';
import { Profile } from '../../lib/types';

interface SettingsViewProps {
  profile: Profile;
  onUpdateProfile: (p: Partial<Profile>) => void;
  onResetDemoData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetDemoData,
  onShowToast,
}) => {
  const [name, setName] = useState(profile.displayName);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [medicalId, setMedicalId] = useState(profile.medicalId);
  const [reminderTime, setReminderTime] = useState(profile.reminderTime || '20:00');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: name.trim() || 'Patient',
      age: Number(age) || 45,
      gender,
      medicalId: medicalId.trim() || 'VMED-0000',
      reminderTime,
    });
    onShowToast('Profile settings successfully saved!', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Reset local state to 14-day Vmedithon demo dataset?')) {
      onResetDemoData();
      onShowToast('Database reset to 14-day pre-seeded demo state!', 'success');
    }
  };

  return (
    <div style={{ padding: '16px 20px' }}>
      {/* Title */}
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Patient Profile & Settings
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Configure chronic care parameters & demo simulation
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <User size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Personal Vitals Profile</h3>
        </div>

        <div className="form-group">
          <label className="form-label">Patient Full Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dheeraj Kumar"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-input"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10))}
              min={1}
              max={120}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Hospital / Medical ID</label>
          <input
            type="text"
            className="form-input"
            value={medicalId}
            onChange={(e) => setMedicalId(e.target.value)}
            placeholder="e.g. VMED-8829-HYP"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Daily Medication Reminder</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="time"
              className="form-input"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            <Bell size={18} color="#94a3b8" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>
          <Check size={18} /> Save Changes
        </button>
      </form>

      {/* Demo Seeding & Reset Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="#818cf8" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Hackathon Demo Controls</h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '14px' }}>
          Instantly re-seed 14 days of realistic multi-source readings (including consecutive high BP anomalies to demonstrate the Medication Nudge banner).
        </p>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          style={{ width: '100%', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe' }}
        >
          <RotateCcw size={16} /> Reset to 14-Day Hackathon Dataset
        </button>
      </div>
    </div>
  );
};
