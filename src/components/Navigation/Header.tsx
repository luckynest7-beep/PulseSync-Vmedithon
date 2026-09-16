import React from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { Profile } from '../../lib/types';

interface HeaderProps {
  profile: Profile;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onOpenSettings }) => {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title">PulseSync</span>
            <span className="brand-badge">PS4</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onOpenSettings}
          className="refresh-btn"
          style={{ padding: '10px 16px', minHeight: '44px' }}
          title="Patient Profile & Settings"
        >
          <ShieldCheck size={18} color="#06b6d4" />
          <span style={{ fontSize: '0.88rem' }}>{profile.displayName.split(' ')[0]}</span>
        </button>
      </div>
    </header>
  );
};
