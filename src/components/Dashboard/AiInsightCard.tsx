import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { AiInsight } from '../../lib/types';

interface AiInsightCardProps {
  insight: AiInsight;
  onRefresh: () => Promise<AiInsight>;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ insight, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const getDirectionPill = (direction: AiInsight['direction']) => {
    switch (direction) {
      case 'rising':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fb7185', fontSize: '0.72rem', fontWeight: 700 }}>
            <TrendingUp size={14} /> Upward Trend
          </span>
        );
      case 'falling':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700 }}>
            <TrendingDown size={14} /> Downward Trend
          </span>
        );
      case 'stable':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>
            <CheckCircle2 size={14} /> Stable Baseline
          </span>
        );
    }
  };

  return (
    <article className="glass-card insight-card" aria-label="AI Health Trend Observation">
      <div className="insight-header">
        <div className="insight-badge">
          <Sparkles size={16} color="#818cf8" />
          <span>Gemini AI Trend Insight</span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="refresh-btn"
          title="Regenerate Trend Analysis"
        >
          <RefreshCw
            size={12}
            style={{
              animation: loading ? 'spin 1s linear infinite' : 'none',
            }}
          />
          <span>{loading ? 'Analyzing...' : 'Refresh'}</span>
        </button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        {getDirectionPill(insight.direction)}
      </div>

      <p className="insight-body">
        {loading ? (
          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
            Synthesizing last 10 readings through clinical trend neural model...
          </span>
        ) : (
          insight.text
        )}
      </p>

      <div className="insight-disclaimer">
        * {insight.disclaimer}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </article>
  );
};
