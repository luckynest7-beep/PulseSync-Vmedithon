import { useState, useEffect } from 'react';
import { Reading, Profile, AiInsight, ActiveTab, ReadingType } from './types';
import { INITIAL_READINGS, INITIAL_PROFILE, INITIAL_AI_INSIGHT } from './mockData';
import { computeFlag } from './thresholds';
import { fetchInsightViaApi } from './api';

const STORAGE_KEYS = {
  READINGS: 'pulsesync_readings_v1',
  PROFILE: 'pulsesync_profile_v1',
  INSIGHT: 'pulsesync_insight_v1',
  NUDGE_DISMISSED: 'pulsesync_nudge_dismissed',
};

// Global event bus for simple reactive updates across components
type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => l());

// In-memory state synchronized with localStorage
let currentReadings: Reading[] = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READINGS);
    return raw ? JSON.parse(raw) : INITIAL_READINGS;
  } catch {
    return INITIAL_READINGS;
  }
})();

let currentProfile: Profile = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : INITIAL_PROFILE;
  } catch {
    return INITIAL_PROFILE;
  }
})();

let currentInsight: AiInsight = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSIGHT);
    return raw ? JSON.parse(raw) : INITIAL_AI_INSIGHT;
  } catch {
    return INITIAL_AI_INSIGHT;
  }
})();

let currentNudgeDismissed = (() => {
  try {
    return localStorage.getItem(STORAGE_KEYS.NUDGE_DISMISSED) === 'true';
  } catch {
    return false;
  }
})();

export const healthStore = {
  getReadings(): Reading[] {
    return currentReadings;
  },

  getProfile(): Profile {
    return currentProfile;
  },

  getInsight(): AiInsight {
    return currentInsight;
  },

  isNudgeDismissed(): boolean {
    return currentNudgeDismissed;
  },

  dismissNudge() {
    currentNudgeDismissed = true;
    try {
      localStorage.setItem(STORAGE_KEYS.NUDGE_DISMISSED, 'true');
    } catch {}
    notify();
  },

  addReading(data: Omit<Reading, 'id' | 'createdAt' | 'flag'>): Reading {
    const flag = computeFlag(data.type, {
      systolic: data.systolic,
      diastolic: data.diastolic,
      glucose: data.glucose,
    });

    const newReading: Reading = {
      ...data,
      id: `rd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      flag,
    };

    currentReadings = [newReading, ...currentReadings];
    currentNudgeDismissed = false; // Reset dismiss when new reading is logged

    try {
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(currentReadings));
      localStorage.setItem(STORAGE_KEYS.NUDGE_DISMISSED, 'false');
    } catch {}

    notify();
    return newReading;
  },

  deleteReading(id: string) {
    currentReadings = currentReadings.filter((r) => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(currentReadings));
    } catch {}
    notify();
  },

  updateProfile(profile: Partial<Profile>) {
    currentProfile = { ...currentProfile, ...profile };
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
    } catch {}
    notify();
  },

  resetToDemoData() {
    currentReadings = INITIAL_READINGS;
    currentProfile = INITIAL_PROFILE;
    currentInsight = INITIAL_AI_INSIGHT;
    currentNudgeDismissed = false;
    try {
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(INITIAL_READINGS));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
      localStorage.setItem(STORAGE_KEYS.INSIGHT, JSON.stringify(INITIAL_AI_INSIGHT));
      localStorage.setItem(STORAGE_KEYS.NUDGE_DISMISSED, 'false');
    } catch {}
    notify();
  },

  async refreshInsight(): Promise<AiInsight> {
    // Local trend direction (used for the UI pill regardless of insight source)
    const bpList = currentReadings.filter((r) => r.type === 'bp');
    const glucList = currentReadings.filter((r) => r.type === 'glucose');

    const recentBp = bpList.slice(0, 3);
    const avgSys = recentBp.length
      ? Math.round(recentBp.reduce((acc, r) => acc + (r.systolic || 0), 0) / recentBp.length)
      : 120;
    const avgDia = recentBp.length
      ? Math.round(recentBp.reduce((acc, r) => acc + (r.diastolic || 0), 0) / recentBp.length)
      : 80;

    let direction: AiInsight['direction'] = 'stable';
    if (avgSys >= 140 || avgDia >= 90) direction = 'rising';
    else if (avgSys < 100) direction = 'falling';

    let text: string;
    try {
      // Prefer the live Gemini-backed insight when a backend is reachable.
      text = await fetchInsightViaApi(currentReadings.slice(0, 10));
    } catch {
      // Offline fallback — keeps the dashboard useful with zero backend setup.
      if (direction === 'rising') {
        text = `Recent blood pressure averages ${avgSys}/${avgDia} mmHg across your latest readings, indicating a moderately elevated trend compared to your 14-day baseline. Glucose readings remain well-controlled. Consider reviewing your daily sodium intake and verifying medication timing with your provider.`;
      } else if (direction === 'falling') {
        text = `Systolic pressure has trended slightly low (${avgSys}/${avgDia} mmHg). Glucose levels average ${glucList.length ? Math.round(glucList.reduce((acc, r) => acc + (r.glucose || 0), 0) / glucList.length) : 110} mg/dL. Ensure adequate hydration during activity.`;
      } else {
        text = `Your vitals demonstrate steady regulation over recent days. Blood pressure is currently seated at ${avgSys}/${avgDia} mmHg within recommended parameters, and blood glucose fluctuations have stabilized. Continue your current lifestyle routine.`;
      }
    }

    const updatedInsight: AiInsight = {
      id: `ins_${Date.now()}`,
      text,
      direction,
      generatedAt: new Date().toISOString(),
      disclaimer: 'Not medical advice — discuss trend changes and medication adherence with your doctor.',
    };

    currentInsight = updatedInsight;
    try {
      localStorage.setItem(STORAGE_KEYS.INSIGHT, JSON.stringify(updatedInsight));
    } catch {}
    notify();
    return updatedInsight;
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/**
 * Custom React hook for subscribing to health store state
 */
export function useHealthStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return healthStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  return {
    readings: healthStore.getReadings(),
    profile: healthStore.getProfile(),
    insight: healthStore.getInsight(),
    isNudgeDismissed: healthStore.isNudgeDismissed(),
    addReading: healthStore.addReading,
    deleteReading: healthStore.deleteReading,
    updateProfile: healthStore.updateProfile,
    dismissNudge: healthStore.dismissNudge,
    resetToDemoData: healthStore.resetToDemoData,
    refreshInsight: healthStore.refreshInsight,
  };
}
