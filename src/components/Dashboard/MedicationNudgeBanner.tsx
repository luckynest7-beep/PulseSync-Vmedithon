import React from 'react';
import { AlertTriangle, X, Pill } from 'lucide-react';
import { Reading } from '../../lib/types';
import { checkMedicationNudge } from '../../lib/thresholds';

interface MedicationNudgeBannerProps {
  readings: Reading[];
  isDismissed: boolean;
  onDismiss: () => void;
}

export const MedicationNudgeBanner: React.FC<MedicationNudgeBannerProps> = ({
  readings,
  isDismissed,
  onDismiss,
}) => {
  if (isDismissed) return null;

  const nudge = checkMedicationNudge(readings);
  if (!nudge.shouldNudge) return null;

  const vitalName = nudge.vitalType === 'bp' ? 'blood pressure' : 'blood glucose';

  return (
    <aside className="nudge-banner" role="alert" aria-live="polite">
      <div className="nudge-icon">
        <AlertTriangle size={20} />
      </div>
      <div className="nudge-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Pill size={14} color="#fb7185" />
          <h4 className="nudge-title">Medication Adherence Check</h4>
        </div>
        <p className="nudge-desc">
          Your last <strong>{nudge.consecutiveCount} {vitalName} readings</strong> were elevated above recommended thresholds. Have you taken your prescribed medication today?
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="nudge-close"
        aria-label="Dismiss banner"
        title="Dismiss"
      >
        <X size={18} />
      </button>
    </aside>
  );
};
