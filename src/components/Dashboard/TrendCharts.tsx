import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Heart, Droplet, TrendingUp } from 'lucide-react';
import { Reading } from '../../lib/types';
import { THRESHOLDS } from '../../lib/thresholds';

interface TrendChartsProps {
  readings: Reading[];
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ readings }) => {
  const [range, setRange] = useState<'7' | '30'>('7');

  // Filter and prepare BP chart data
  const bpReadings = readings
    .filter((r) => r.type === 'bp')
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());

  const bpData = (range === '7' ? bpReadings.slice(-7) : bpReadings.slice(-30)).map((r) => {
    const d = new Date(r.takenAt);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
      flag: r.flag,
    };
  });

  // Filter and prepare Glucose chart data
  const glucReadings = readings
    .filter((r) => r.type === 'glucose')
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());

  const glucData = (range === '7' ? glucReadings.slice(-7) : glucReadings.slice(-30)).map((r) => {
    const d = new Date(r.takenAt);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      glucose: r.glucose,
      flag: r.flag,
    };
  });

  const CustomBpTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.78rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
            {label} at {data.time}
          </div>
          <div style={{ color: '#f43f5e', fontWeight: 700 }}>
            Systolic: {data.systolic} mmHg
          </div>
          <div style={{ color: '#06b6d4', fontWeight: 700 }}>
            Diastolic: {data.diastolic} mmHg
          </div>
          {data.pulse && (
            <div style={{ color: '#a855f7', fontSize: '0.72rem', marginTop: '2px' }}>
              Pulse: {data.pulse} bpm
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomGlucTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.78rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>
            {label} at {data.time}
          </div>
          <div style={{ color: '#22d3ee', fontWeight: 700 }}>
            Glucose: {data.glucose} mg/dL
          </div>
          {data.flag === 'high' && (
            <div style={{ color: '#f43f5e', fontSize: '0.72rem', fontWeight: 600 }}>
              Status: Elevated (&gt;180)
            </div>
          )}
          {data.flag === 'low' && (
            <div style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600 }}>
              Status: Low (&lt;70)
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="charts-section" aria-label="Clinical Trend Charts">
      {/* BP Trend Chart */}
      <article className="glass-card">
        <div className="chart-header">
          <div className="chart-title">
            <Heart size={18} color="#f43f5e" />
            <span>Blood Pressure Trend</span>
          </div>

          <div className="segmented-control">
            <button
              className={`segment-btn ${range === '7' ? 'active' : ''}`}
              onClick={() => setRange('7')}
            >
              7 Reads
            </button>
            <button
              className={`segment-btn ${range === '30' ? 'active' : ''}`}
              onClick={() => setRange('30')}
            >
              30 Reads
            </button>
          </div>
        </div>

        {bpData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            No BP readings recorded yet.
          </div>
        ) : (
          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bpData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  domain={[50, 180]}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip content={<CustomBpTooltip />} />

                {/* Clinical Reference Threshold Lines */}
                <ReferenceLine
                  y={THRESHOLDS.bp.systolicHigh}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  label={{
                    value: '140 High',
                    fill: '#f43f5e',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={THRESHOLDS.bp.diastolicHigh}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  label={{
                    value: '90 High',
                    fill: '#f59e0b',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ fill: '#f43f5e', r: 3.5 }}
                  activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ fill: '#06b6d4', r: 3.5 }}
                  activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
            <span>Systolic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
            <span>Diastolic</span>
          </div>
        </div>
      </article>

      {/* Glucose Trend Chart */}
      <article className="glass-card">
        <div className="chart-header">
          <div className="chart-title">
            <Droplet size={18} color="#06b6d4" />
            <span>Blood Glucose Trend</span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            mg/dL
          </span>
        </div>

        {glucData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            No Glucose readings recorded yet.
          </div>
        ) : (
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={glucData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  domain={[50, 240]}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip content={<CustomGlucTooltip />} />

                {/* Target Range Reference Lines */}
                <ReferenceLine
                  y={THRESHOLDS.glucose.high}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  label={{
                    value: '180 Target Ceiling',
                    fill: '#f43f5e',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={THRESHOLDS.glucose.low}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  label={{
                    value: '70 Hypo Floor',
                    fill: '#f59e0b',
                    fontSize: 9,
                    position: 'insideBottomRight',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="glucose"
                  name="Glucose"
                  stroke="#22d3ee"
                  strokeWidth={2.8}
                  dot={{ fill: '#22d3ee', r: 3.5 }}
                  activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>
    </section>
  );
};
