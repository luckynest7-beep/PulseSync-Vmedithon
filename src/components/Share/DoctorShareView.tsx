import React, { useState } from 'react';
import { Download, Share2, FileText, CheckCircle2, Shield, Calendar, Activity, AlertCircle } from 'lucide-react';
import { Reading, Profile, AiInsight } from '../../lib/types';
import { generateDoctorReportPdf } from '../../lib/pdfExport';
import { formatVitalDisplay } from '../../lib/thresholds';

interface DoctorShareViewProps {
  profile: Profile;
  readings: Reading[];
  insight: AiInsight;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DoctorShareView: React.FC<DoctorShareViewProps> = ({
  profile,
  readings,
  insight,
  onShowToast,
}) => {
  const [downloading, setDownloading] = useState(false);

  const bpReadings = readings.filter((r) => r.type === 'bp');
  const glucReadings = readings.filter((r) => r.type === 'glucose');
  const anomalies = readings.filter((r) => r.flag !== null);

  const avgSys = bpReadings.length
    ? Math.round(bpReadings.reduce((acc, r) => acc + (r.systolic || 0), 0) / bpReadings.length)
    : 0;
  const avgDia = bpReadings.length
    ? Math.round(bpReadings.reduce((acc, r) => acc + (r.diastolic || 0), 0) / bpReadings.length)
    : 0;
  const avgGluc = glucReadings.length
    ? Math.round(glucReadings.reduce((acc, r) => acc + (r.glucose || 0), 0) / glucReadings.length)
    : 0;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const pdfBlob = await generateDoctorReportPdf(profile, readings, insight);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PulseSync_Doctor_Report_${profile.displayName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Clinical Doctor PDF successfully generated & downloaded!', 'success');
    } catch (err: any) {
      console.error('PDF Generation error:', err);
      onShowToast('Failed to generate PDF report.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${profile.medicalId.toLowerCase()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      onShowToast('Read-only clinician link copied to clipboard!', 'success');
    }
  };

  return (
    <div style={{ padding: '16px 20px' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Provider Clinical Sharing
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Export structured 14-day history directly to your cardiologist or endocrinologist
        </p>
      </div>

      {/* Main Action Card */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Physician Vitals Summary</h3>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Standardized A4 Clinical PDF • Ready for EHR integration
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
          Includes patient demographic header, 14-day averages, BP systolic/diastolic trend line, glucose stability, flagged anomalies, and Gemini AI observation summary.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={downloading}
            style={{ flex: 2 }}
          >
            <Download size={18} />
            <span>{downloading ? 'Compiling PDF...' : 'Download Clinical PDF'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyLink}
            style={{ flex: 1 }}
            title="Copy read-only link"
          >
            <Share2 size={16} /> Link
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>
        Live Report Preview:
      </div>

      <div
        className="glass-card"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '18px',
        }}
      >
        {/* Mock Report Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#06b6d4' }}>
              PULSESYNC CLINICAL LOG
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Patient: {profile.displayName} (ID: {profile.medicalId})
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b' }}>
            <div>Age: {profile.age} yrs • {profile.gender}</div>
            <div>{readings.length} total readings</div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>AVG BP</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }} className="tabular-nums">
              {avgSys}/{avgDia}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>AVG GLUCOSE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }} className="tabular-nums">
              {avgGluc} mg/dL
            </div>
          </div>

          <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#fda4af' }}>ANOMALIES</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fb7185' }} className="tabular-nums">
              {anomalies.length} Flagged
            </div>
          </div>
        </div>

        {/* AI Summary Preview Box */}
        <div
          style={{
            background: 'rgba(6, 182, 212, 0.05)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '14px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22d3ee', marginBottom: '4px' }}>
            CLINICAL AI TREND SUMMARY:
          </div>
          <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.45 }}>
            {insight.text}
          </p>
        </div>

        {/* Table Sample */}
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
          LAST 5 ENTRIES IN REPORT:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {readings.slice(0, 5).map((r) => {
            const formatted = formatVitalDisplay(r);
            const d = new Date(r.takenAt);
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ color: '#94a3b8' }}>
                  {d.getMonth() + 1}/{d.getDate()} • {r.type.toUpperCase()}
                </span>
                <span style={{ fontWeight: 700, color: '#f8fafc' }} className="tabular-nums">
                  {formatted.primaryValue} {formatted.unit}
                </span>
                <span
                  style={{
                    color: r.flag === 'high' ? '#fb7185' : r.flag === 'low' ? '#fbbf24' : '#34d399',
                    fontWeight: 600,
                  }}
                >
                  {r.flag ? r.flag.toUpperCase() : 'Normal'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
