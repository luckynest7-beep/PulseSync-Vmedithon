import React from 'react';
import { Heart, Droplet, Clock, Camera, Mic, Edit3 } from 'lucide-react';
import { Reading } from '../../lib/types';
import { formatVitalDisplay } from '../../lib/thresholds';

interface LatestReadingsCardProps {
  readings: Reading[];
  onSelectReading: (reading: Reading) => void;
}

export const LatestReadingsCard: React.FC<LatestReadingsCardProps> = ({
  readings,
  onSelectReading,
}) => {
  const latestBp = readings.find((r) => r.type === 'bp');
  const latestGlucose = readings.find((r) => r.type === 'glucose');

  const getSourceIcon = (source: Reading['source']) => {
    switch (source) {
      case 'camera':
        return <Camera size={12} />;
      case 'voice':
        return <Mic size={12} />;
      case 'manual':
        return <Edit3 size={12} />;
    }
  };

  const formatRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <section className="vitals-grid" aria-label="Latest Vitals Overview">
      {/* Latest BP Card */}
      <article
        className="glass-card vital-card"
        onClick={() => latestBp && onSelectReading(latestBp)}
        style={{ cursor: latestBp ? 'pointer' : 'default' }}
      >
        <div className="vital-header">
          <div className="vital-icon-wrap vital-icon-bp">
            <Heart size={18} strokeWidth={2.4} />
          </div>
          {latestBp && (
            <span
              className={`vital-tag vital-tag-${
                latestBp.flag === 'high' ? 'high' : latestBp.flag === 'low' ? 'low' : 'normal'
              }`}
            >
              {latestBp.flag === 'high' ? 'High' : latestBp.flag === 'low' ? 'Low' : 'Normal'}
            </span>
          )}
        </div>

        <div>
          <div className="vital-label">Blood Pressure</div>
          <div className="vital-value-wrap">
            <span className="vital-value tabular-nums">
              {latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : '--/--'}
            </span>
            <span className="vital-unit">mmHg</span>
          </div>
        </div>

        <div className="vital-footer">
          {latestBp ? (
            <>
              <Clock size={12} />
              <span>{formatRelativeTime(latestBp.takenAt)}</span>
              <span style={{ margin: '0 3px' }}>•</span>
              {getSourceIcon(latestBp.source)}
              <span style={{ textTransform: 'capitalize' }}>{latestBp.source}</span>
            </>
          ) : (
            <span>No readings yet</span>
          )}
        </div>
      </article>

      {/* Latest Glucose Card */}
      <article
        className="glass-card vital-card"
        onClick={() => latestGlucose && onSelectReading(latestGlucose)}
        style={{ cursor: latestGlucose ? 'pointer' : 'default' }}
      >
        <div className="vital-header">
          <div className="vital-icon-wrap vital-icon-glucose">
            <Droplet size={18} strokeWidth={2.4} />
          </div>
          {latestGlucose && (
            <span
              className={`vital-tag vital-tag-${
                latestGlucose.flag === 'high'
                  ? 'high'
                  : latestGlucose.flag === 'low'
                  ? 'low'
                  : 'normal'
              }`}
            >
              {latestGlucose.flag === 'high'
                ? 'High'
                : latestGlucose.flag === 'low'
                ? 'Low'
                : 'Target'}
            </span>
          )}
        </div>

        <div>
          <div className="vital-label">Blood Glucose</div>
          <div className="vital-value-wrap">
            <span className="vital-value tabular-nums">
              {latestGlucose?.glucose ?? '--'}
            </span>
            <span className="vital-unit">mg/dL</span>
          </div>
        </div>

        <div className="vital-footer">
          {latestGlucose ? (
            <>
              <Clock size={12} />
              <span>{formatRelativeTime(latestGlucose.takenAt)}</span>
              <span style={{ margin: '0 3px' }}>•</span>
              {getSourceIcon(latestGlucose.source)}
              <span style={{ textTransform: 'capitalize' }}>{latestGlucose.source}</span>
            </>
          ) : (
            <span>No readings yet</span>
          )}
        </div>
      </article>
    </section>
  );
};
