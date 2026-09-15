import React, { useState } from 'react';
import { Heart, Droplet, Camera, Mic, Edit3, Plus, Filter, AlertTriangle } from 'lucide-react';
import { Reading, ReadingType } from '../../lib/types';
import { formatVitalDisplay } from '../../lib/thresholds';

interface TimelineViewProps {
  readings: Reading[];
  onSelectReading: (reading: Reading) => void;
  onOpenAddModal: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  readings,
  onSelectReading,
  onOpenAddModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'bp' | 'glucose' | 'anomalies'>('all');

  // Filter readings
  const filtered = readings.filter((r) => {
    if (filter === 'bp') return r.type === 'bp';
    if (filter === 'glucose') return r.type === 'glucose';
    if (filter === 'anomalies') return r.flag !== null;
    return true;
  });

  // Sort reverse chronological
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
  );

  // Group by Day (Today, Yesterday, Date)
  const groupedByDay: { [key: string]: Reading[] } = {};
  sorted.forEach((r) => {
    const d = new Date(r.takenAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key = '';
    if (d.toDateString() === today.toDateString()) {
      key = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    } else {
      key = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    if (!groupedByDay[key]) {
      groupedByDay[key] = [];
    }
    groupedByDay[key].push(r);
  });

  const getSourceIcon = (source: Reading['source']) => {
    switch (source) {
      case 'camera':
        return <Camera size={13} />;
      case 'voice':
        return <Mic size={13} />;
      case 'manual':
        return <Edit3 size={13} />;
    }
  };

  return (
    <div className="timeline-container">
      {/* Header Title */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Personal Vitals History
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Unified cross-device timeline • {readings.length} total entries
        </p>
      </div>

      {/* Filter Bar */}
      <div className="timeline-filter-bar">
        <button
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Records ({readings.length})
        </button>
        <button
          className={`filter-chip ${filter === 'bp' ? 'active' : ''}`}
          onClick={() => setFilter('bp')}
        >
          Blood Pressure
        </button>
        <button
          className={`filter-chip ${filter === 'glucose' ? 'active' : ''}`}
          onClick={() => setFilter('glucose')}
        >
          Blood Glucose
        </button>
        <button
          className={`filter-chip ${filter === 'anomalies' ? 'active' : ''}`}
          onClick={() => setFilter('anomalies')}
        >
          Anomalies ({readings.filter((r) => r.flag !== null).length})
        </button>
      </div>

      {/* Grouped Day List */}
      {Object.keys(groupedByDay).length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
            }}
          >
            <Filter size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
            No readings found
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '280px', margin: '0 auto 18px auto' }}>
            No vitals match your current filter. Capture your first reading using camera or voice.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: 'auto', display: 'inline-flex' }}
            onClick={onOpenAddModal}
          >
            <Plus size={16} /> Capture New Reading
          </button>
        </div>
      ) : (
        Object.entries(groupedByDay).map(([dayLabel, dayReadings]) => (
          <div key={dayLabel} className="timeline-group">
            <div className="timeline-date-header">{dayLabel}</div>

            <div className="timeline-list">
              {dayReadings.map((reading) => {
                const formatted = formatVitalDisplay(reading);
                const timeStr = new Date(reading.takenAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <article
                    key={reading.id}
                    className="glass-card timeline-item"
                    onClick={() => onSelectReading(reading)}
                  >
                    <div className="timeline-item-left">
                      <div
                        className={`timeline-item-icon ${
                          reading.type === 'bp'
                            ? 'vital-icon-bp'
                            : 'vital-icon-glucose'
                        }`}
                      >
                        {reading.type === 'bp' ? (
                          <Heart size={18} strokeWidth={2.4} />
                        ) : (
                          <Droplet size={18} strokeWidth={2.4} />
                        )}
                      </div>

                      <div className="timeline-item-info">
                        <h4>
                          {formatted.primaryValue}{' '}
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                            {formatted.unit}
                          </span>
                        </h4>
                        <div className="timeline-item-sub">
                          <span>{timeStr}</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            {getSourceIcon(reading.source)}
                            <span style={{ textTransform: 'capitalize' }}>{reading.source}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="timeline-item-right">
                      <span
                        className={`vital-tag vital-tag-${
                          reading.flag === 'high'
                            ? 'high'
                            : reading.flag === 'low'
                            ? 'low'
                            : 'normal'
                        }`}
                      >
                        {reading.flag === 'high'
                          ? 'High'
                          : reading.flag === 'low'
                          ? 'Low'
                          : 'Normal'}
                      </span>

                      {formatted.secondaryValue && (
                        <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 600 }}>
                          {formatted.secondaryValue}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
