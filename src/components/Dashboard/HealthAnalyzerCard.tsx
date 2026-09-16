import React, { useState } from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import { Profile, Reading } from '../../lib/types';
import { HealthAnalyzerModal } from './HealthAnalyzerModal';

interface HealthAnalyzerCardProps {
  readings: Reading[];
  profile: Profile;
}

export const HealthAnalyzerCard: React.FC<HealthAnalyzerCardProps> = ({ readings, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasReadings = readings.length > 0;

  return (
    <>
      <article className="glass-card insight-card" aria-label="AI Health Record Analyzer">
        <div className="insight-header">
          <div className="insight-badge">
            <Brain size={16} color="#a5b4fc" />
            <span>AI Health Analyzer</span>
          </div>
        </div>

        <p className="insight-body" style={{ marginBottom: '12px' }}>
          {hasReadings
            ? 'Get a deeper look across your entire record history — patterns, correlations, and practical suggestions, not just your last few readings.'
            : 'Add your first reading to unlock a full analysis of your health record history.'}
        </p>

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!hasReadings}
          onClick={() => setIsOpen(true)}
        >
          Run Full Analysis
          <ArrowRight size={18} />
        </button>
      </article>

      <HealthAnalyzerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        readings={readings}
        profile={profile}
      />
    </>
  );
};
