import { Flag, ReadingType } from './types.js';

export const THRESHOLDS = {
  bp: { systolicHigh: 140, diastolicHigh: 90, systolicLow: 90, diastolicLow: 60 },
  glucose: { high: 180, low: 70 },
};

export function computeFlag(
  type: ReadingType,
  values: { systolic?: number | null; diastolic?: number | null; glucose?: number | null }
): Flag {
  if (type === 'bp') {
    const { systolic, diastolic } = values;
    if (systolic == null || diastolic == null) return null;
    if (systolic >= THRESHOLDS.bp.systolicHigh || diastolic >= THRESHOLDS.bp.diastolicHigh) return 'high';
    if (systolic < THRESHOLDS.bp.systolicLow || diastolic < THRESHOLDS.bp.diastolicLow) return 'low';
    return null;
  }
  if (type === 'glucose') {
    const { glucose } = values;
    if (glucose == null) return null;
    if (glucose >= THRESHOLDS.glucose.high) return 'high';
    if (glucose < THRESHOLDS.glucose.low) return 'low';
    return null;
  }
  return null;
}
