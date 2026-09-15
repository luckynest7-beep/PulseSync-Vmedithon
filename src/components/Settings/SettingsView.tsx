import React, { useState } from 'react';
import { User, Check, Bell, PhoneCall, Phone, LogOut } from 'lucide-react';
import { Profile } from '../../lib/types';

interface SettingsViewProps {
  profile: Profile;
  onUpdateProfile: (p: Partial<Profile>) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onSignOut?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onShowToast,
  onSignOut,
}) => {
  const [name, setName] = useState(profile.displayName);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [medicalId, setMedicalId] = useState(profile.medicalId);
  const [reminderTime, setReminderTime] = useState(profile.reminderTime || '20:00');
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || '');
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergencyContactPhone || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: name.trim() || 'Patient',
      age: Number(age) || 45,
      gender,
      medicalId: medicalId.trim() || 'VMED-0000',
      reminderTime,
      phoneNumber: phoneNumber.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    });
    onShowToast('Profile settings successfully saved!', 'success');
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
          <label className="form-label">Your Mobile Number</label>
          <div style={{ position: 'relative' }}>
            <Phone size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#64748b' }} />
            <input
              type="tel"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
            />
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

        <div
          style={{
            marginTop: '4px',
            marginBottom: '14px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <PhoneCall size={16} color="#fb7185" />
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fda4af' }}>Emergency Contact</h4>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>
            If a reading comes back at an emergency-level extreme (e.g. a hypertensive crisis
            or severe hypoglycemia), PulseSync will prompt you to call this person immediately.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                className="form-input"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="e.g. Mom"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>
          <Check size={18} /> Save Changes
        </button>
      </form>

      {onSignOut && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onSignOut}
          style={{ width: '100%', color: '#fda4af', borderColor: 'rgba(244, 63, 94, 0.3)' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      )}
    </div>
  );
};
