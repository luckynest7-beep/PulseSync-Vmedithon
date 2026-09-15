import { Reading, ReadingType, Flag } from './types';

export const THRESHOLDS = {
  bp: {
    systolicHigh: 140,
    diastolicHigh: 90,
    systolicLow: 90,
    diastolicLow: 60,
  },
  glucose: {
    high: 180, // mg/dL
    low: 70,   // mg/dL
  },
};

/**
 * Computes the clinical flag for a given reading according to clinical reference guidelines.
 * Returns 'high' | 'low' | null
 */
export function computeFlag(
  type: ReadingType,
  values: { systolic?: number; diastolic?: number; glucose?: number }
): Flag {
  if (type === 'bp') {
    const { systolic, diastolic } = values;
    if (systolic === undefined || diastolic === undefined) return null;

    if (systolic >= THRESHOLDS.bp.systolicHigh || diastolic >= THRESHOLDS.bp.diastolicHigh) {
      return 'high';
    }
    if (systolic < THRESHOLDS.bp.systolicLow || diastolic < THRESHOLDS.bp.diastolicLow) {
      return 'low';
    }
    return null;
  }

  if (type === 'glucose') {
    const { glucose } = values;
    if (glucose === undefined) return null;

    if (glucose >= THRESHOLDS.glucose.high) {
      return 'high';
    }
    if (glucose < THRESHOLDS.glucose.low) {
      return 'low';
    }
    return null;
  }

  return null;
}

/**
 * Checks if the last 2+ consecutive readings of the same vital type are flagged High.
 * Used for F8 Medication Nudge Banner.
 */
export function checkMedicationNudge(readings: Reading[]): {
  shouldNudge: boolean;
  vitalType?: ReadingType;
  consecutiveCount: number;
} {
  // Sort reverse-chronological
  const sorted = [...readings].sort(
    (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
  );

  const bpReadings = sorted.filter((r) => r.type === 'bp');
  const glucoseReadings = sorted.filter((r) => r.type === 'glucose');

  // Check BP consecutive highs
  let bpHighCount = 0;
  for (const r of bpReadings) {
    if (r.flag === 'high') {
      bpHighCount++;
    } else {
      break;
    }
  }

  if (bpHighCount >= 2) {
    return { shouldNudge: true, vitalType: 'bp', consecutiveCount: bpHighCount };
  }

  // Check Glucose consecutive highs
  let glucoseHighCount = 0;
  for (const r of glucoseReadings) {
    if (r.flag === 'high') {
      glucoseHighCount++;
    } else {
      break;
    }
  }

  if (glucoseHighCount >= 2) {
    return { shouldNudge: true, vitalType: 'glucose', consecutiveCount: glucoseHighCount };
  }

  return { shouldNudge: false, consecutiveCount: 0 };
}

/**
 * Format vital values for UI display
 */
export function formatVitalDisplay(reading: Reading): {
  primaryValue: string;
  unit: string;
  secondaryValue?: string;
  statusLabel: string;
  statusColor: string;
} {
  if (reading.type === 'bp') {
    const primary = `${reading.systolic ?? '--'}/${reading.diastolic ?? '--'}`;
    const pulse = reading.pulse ? `${reading.pulse} bpm` : undefined;
    
    let statusLabel = 'Normal';
    let statusColor = 'emerald';
    if (reading.flag === 'high') {
      statusLabel = 'Elevated (Stage 1/2)';
      statusColor = 'rose';
    } else if (reading.flag === 'low') {
      statusLabel = 'Hypotension';
      statusColor = 'amber';
    }

    return {
      primaryValue: primary,
      unit: 'mmHg',
      secondaryValue: pulse,
      statusLabel,
      statusColor,
    };
  } else {
    const primary = `${reading.glucose ?? '--'}`;
    let statusLabel = 'In Target Range';
    let statusColor = 'emerald';
    if (reading.flag === 'high') {
      statusLabel = 'Hyperglycemia';
      statusColor = 'rose';
    } else if (reading.flag === 'low') {
      statusLabel = 'Hypoglycemia';
      statusColor = 'amber';
    }

    return {
      primaryValue: primary,
      unit: 'mg/dL',
      statusLabel,
      statusColor,
    };
  }
}
