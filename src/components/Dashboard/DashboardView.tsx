import React from 'react';
import { Profile, Reading, AiInsight } from '../../lib/types';
import { MedicationNudgeBanner } from './MedicationNudgeBanner';
import { LatestReadingsCard } from './LatestReadingsCard';
import { TrendCharts } from './TrendCharts';
import { AiInsightCard } from './AiInsightCard';
import { HealthAnalyzerCard } from './HealthAnalyzerCard';

interface DashboardViewProps {
  profile: Profile;
  readings: Reading[];
  insight: AiInsight;
  isNudgeDismissed: boolean;
  onDismissNudge: () => void;
  onSelectReading: (reading: Reading) => void;
  onRefreshInsight: () => Promise<AiInsight>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  readings,
  insight,
  isNudgeDismissed,
  onDismissNudge,
  onSelectReading,
  onRefreshInsight,
}) => {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <main>
      {/* Greeting & Date Header */}
      <section className="greeting-section">
        <div className="greeting-text">{todayFormatted}</div>
        <h1 className="patient-name">Hello, {profile.displayName}</h1>
      </section>

      {/* Medication Nudge (F8) */}
      <MedicationNudgeBanner
        readings={readings}
        isDismissed={isNudgeDismissed}
        onDismiss={onDismissNudge}
      />

      {/* Latest Vitals Glance */}
      <LatestReadingsCard
        readings={readings}
        onSelectReading={onSelectReading}
      />

      {/* Recharts Clinical Trend Charts (F3) */}
      <TrendCharts readings={readings} />

      {/* Gemini AI Trend Summary (F4) */}
      <AiInsightCard insight={insight} onRefresh={onRefreshInsight} />

      {/* AI Health Record Analyzer — full-history pattern analysis */}
      <HealthAnalyzerCard readings={readings} profile={profile} />
    </main>
  );
};
