import React, { useEffect, useState } from 'react';
import { X, Brain, AlertTriangle, AlertCircle, CheckCircle2, ListChecks, Lightbulb } from 'lucide-react';
import { HealthAnalysis, Profile, Reading } from '../../lib/types';
import { analyzeRecordsViaApi } from '../../lib/api';

interface HealthAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: Reading[];
  profile: Profile;
}

function offlineFallback(readings: Reading[]): HealthAnalysis {
  return {
    overallSummary: readings.length
      ? "AI analysis couldn't be reached right now, so here's what we can tell locally: your full history is still being tracked safely and is visible in the Timeline and Trend charts."
      : 'Add a few readings to unlock a full AI analysis of your health record.',
    patterns: [],
    suggestions: [],
    urgency: 'routine',
    disclaimer:
      'This is an automated pattern summary, not a diagnosis. Always discuss changes in your readings or symptoms with a qualified healthcare provider.',
  };
}

const URGENCY_META: Record<HealthAnalysis['urgency'], { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  routine: { label: 'Routine — values look steady', color: '#34d399', Icon: CheckCircle2 },
  monitor_closely: { label: 'Worth Monitoring Closely', color: '#fbbf24', Icon: AlertCircle },
  discuss_with_doctor_soon: { label: 'Discuss With Your Doctor Soon', color: '#fb7185', Icon: AlertTriangle },
};

export const HealthAnalyzerModal: React.FC<HealthAnalyzerModalProps> = ({
  isOpen,
  onClose,
  readings,
  profile,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setAnalysis(null);

    analyzeRecordsViaApi(readings, { age: profile.age, gender: profile.gender })
      .then((result) => {
        if (!cancelled) setAnalysis(result);
      })
      .catch(() => {
        if (!cancelled) setAnalysis(offlineFallback(readings));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const urgency = analysis ? URGENCY_META[analysis.urgency] : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={20} color="#a5b4fc" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AI Health Analyzer</h2>
          </div>
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

        {loading ? (
          <p className="insight-body" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
            Reviewing your full record history for patterns and correlations...
          </p>
        ) : analysis ? (
          <>
            {urgency && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: urgency.color,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                <urgency.Icon size={16} />
                {urgency.label}
              </div>
            )}

            <p className="insight-body">{analysis.overallSummary}</p>

            {analysis.patterns.length > 0 && (
              <div className="glass-card" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <ListChecks size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>Patterns Noticed</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.patterns.map((p, i) => (
                    <li key={i} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div className="glass-card" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Lightbulb size={16} color="#34d399" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>Suggestions</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="insight-disclaimer">* {analysis.disclaimer}</div>
          </>
        ) : null}
      </div>
    </div>
  );
};
