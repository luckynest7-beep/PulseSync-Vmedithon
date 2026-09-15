import { jsPDF } from 'jspdf';
import { Reading, Profile, AiInsight } from './types';
import { formatVitalDisplay } from './thresholds';

export async function generateDoctorReportPdf(
  profile: Profile,
  readings: Reading[],
  insight: AiInsight
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  // Background Header Banner
  doc.setFillColor(15, 23, 42); // Dark Slate (#0f172a)
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Brand / Header Title
  doc.setTextColor(6, 182, 212); // Cyan (#06b6d4)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PULSESYNC CLINICAL SUMMARY', 15, y);

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Unified Chronic Disease Vitals Log (Problem Statement PS4)', 15, y + 6);

  // Generation Date Badge
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const dateStr = `Generated: ${new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  doc.text(dateStr, pageWidth - 15, y + 6, { align: 'right' });

  y = 42;

  // Patient Demographic Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT INFORMATION', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text(`Name: ${profile.displayName}`, 20, y + 14);
  doc.text(`Age / Gender: ${profile.age} yrs / ${profile.gender}`, 80, y + 14);
  doc.text(`Medical ID: ${profile.medicalId}`, 145, y + 14);

  const bpReadings = readings.filter((r) => r.type === 'bp');
  const glucReadings = readings.filter((r) => r.type === 'glucose');
  const anomalies = readings.filter((r) => r.flag !== null);

  doc.text(`Total Records: ${readings.length} readings`, 20, y + 20);
  doc.text(`Target BP: < 140/90 mmHg`, 80, y + 20);
  doc.text(`Target Glucose: 70–180 mg/dL`, 145, y + 20);

  y += 32;

  // Vitals Metric Summary Cards
  const avgSys = bpReadings.length
    ? Math.round(bpReadings.reduce((acc, r) => acc + (r.systolic || 0), 0) / bpReadings.length)
    : 0;
  const avgDia = bpReadings.length
    ? Math.round(bpReadings.reduce((acc, r) => acc + (r.diastolic || 0), 0) / bpReadings.length)
    : 0;
  const avgGluc = glucReadings.length
    ? Math.round(glucReadings.reduce((acc, r) => acc + (r.glucose || 0), 0) / glucReadings.length)
    : 0;

  // Card 1: Avg Blood Pressure
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, y, 55, 18, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('14-DAY AVERAGE BP', 19, y + 5);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(bpReadings.length ? `${avgSys}/${avgDia} mmHg` : 'N/A', 19, y + 13);

  // Card 2: Avg Glucose
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(75, y, 55, 18, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('14-DAY AVERAGE GLUCOSE', 79, y + 5);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(glucReadings.length ? `${avgGluc} mg/dL` : 'N/A', 79, y + 13);

  // Card 3: Out-of-Range Flags
  doc.setFillColor(254, 242, 242); // Rose 50
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(135, y, pageWidth - 150, 18, 1.5, 1.5, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(159, 18, 57);
  doc.text('OUT-OF-RANGE READINGS', 139, y + 5);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${anomalies.length} Flagged`, 139, y + 13);

  y += 26;

  // AI Trend Summary Callout
  doc.setFillColor(240, 253, 250); // Teal 50
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(15, y, pageWidth - 30, 26, 2, 2, 'FD');

  doc.setTextColor(13, 148, 136); // Teal 600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('AI TREND SUMMARY (NON-DIAGNOSTIC OBSERVATION)', 20, y + 6);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const splitInsight = doc.splitTextToSize(insight.text, pageWidth - 40);
  doc.text(splitInsight, 20, y + 12);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`* ${insight.disclaimer}`, 20, y + 22);

  y += 34;

  // Table Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('RECENT RECORDED READINGS (CAMERA / VOICE / MANUAL)', 15, y);

  y += 5;

  // Table Headers
  doc.setFillColor(226, 232, 240);
  doc.rect(15, y, pageWidth - 30, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  doc.text('Date & Time', 18, y + 4.8);
  doc.text('Type', 65, y + 4.8);
  doc.text('Value', 95, y + 4.8);
  doc.text('Source', 130, y + 4.8);
  doc.text('Clinical Status', 160, y + 4.8);

  y += 7;

  // Render Table Rows
  const sorted = [...readings].sort(
    (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
  );

  const maxRows = 16;
  const displayRows = sorted.slice(0, maxRows);

  displayRows.forEach((r, idx) => {
    const formatted = formatVitalDisplay(r);
    const isEven = idx % 2 === 0;

    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, pageWidth - 30, 6.5, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    // Date
    const d = new Date(r.takenAt);
    const dateFormatted = `${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    doc.text(dateFormatted, 18, y + 4.5);

    // Type
    doc.text(r.type === 'bp' ? 'Blood Pressure' : 'Blood Glucose', 65, y + 4.5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${formatted.primaryValue} ${formatted.unit}`, 95, y + 4.5);

    // Source
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(r.source.toUpperCase(), 130, y + 4.5);

    // Status / Flag
    if (r.flag === 'high') {
      doc.setTextColor(225, 29, 72); // Rose
      doc.setFont('helvetica', 'bold');
      doc.text('ELEVATED (HIGH)', 160, y + 4.5);
    } else if (r.flag === 'low') {
      doc.setTextColor(217, 119, 6); // Amber
      doc.setFont('helvetica', 'bold');
      doc.text('LOW', 160, y + 4.5);
    } else {
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text('Normal', 160, y + 4.5);
    }

    y += 6.5;
  });

  // Footer Disclaimer & Clinician Signature Block
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, footerY - 4, pageWidth - 15, footerY - 4);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'PulseSync AI Platform — Free-Tier Gemini 2.5 Flash Lite + Mobile Web OCR. Confidential Medical Record.',
    15,
    footerY
  );
  doc.text('Doctor Signature: _______________________', pageWidth - 15, footerY, {
    align: 'right',
  });

  return doc.output('blob');
}
