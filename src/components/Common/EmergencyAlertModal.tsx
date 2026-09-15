import React from 'react';
import { AlertOctagon, PhoneCall, Settings as SettingsIcon, X } from 'lucide-react';
import { Profile } from '../../lib/types';

interface EmergencyAlertModalProps {
  reason: string | null;
  profile: Profile;
  onDismiss: () => void;
  onOpenSettings: () => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  reason,
  profile,
  onDismiss,
  onOpenSettings,
}) => {
  if (!reason) return null;

  const hasContact = Boolean(profile.emergencyContactPhone?.trim());

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid rgba(244, 63, 94, 0.5)' }}
      >
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertOctagon size={24} color="#fb7185" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fda4af', letterSpacing: '-0.01em' }}>
                Medical Emergency Detected
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{reason}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
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
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
          This reading is well outside the normal range. This app cannot diagnose or place a
          call for you — please seek medical attention now if you feel unwell.
        </p>

        {hasContact ? (
          <a
            href={`tel:${profile.emergencyContactPhone}`}
            className="btn btn-primary"
            style={{ width: '100%', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', marginBottom: '10px' }}
          >
            <PhoneCall size={18} /> Call {profile.emergencyContactName?.trim() || 'Emergency Contact'} Now
          </a>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenSettings}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <SettingsIcon size={16} /> Add an Emergency Contact in Settings
          </button>
        )}

        <button type="button" className="btn btn-secondary" onClick={onDismiss} style={{ width: '100%' }}>
          I'm OK — Dismiss
        </button>
      </div>
    </div>
  );
};
