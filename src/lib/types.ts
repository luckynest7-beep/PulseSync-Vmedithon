export type ReadingType = 'bp' | 'glucose';
export type ReadingSource = 'camera' | 'voice' | 'manual';
export type Flag = 'high' | 'low' | null;

export interface Reading {
  id: string;            // uuid
  userId: string;
  type: ReadingType;
  systolic?: number;     // bp only (mmHg)
  diastolic?: number;    // bp only (mmHg)
  pulse?: number;        // bp only, optional (bpm)
  glucose?: number;      // glucose only, mg/dL
  source: ReadingSource;
  flag: Flag;            // computed at save time via thresholds.ts
  takenAt: string;       // ISO timestamp
  createdAt: string;     // ISO timestamp
  notes?: string;
  deviceImage?: string;  // captured image base64 / blob preview URL
}

export interface Profile {
  userId: string;
  displayName: string;
  age: number;
  gender: string;
  medicalId: string;
  glucoseUnit: 'mg/dL' | 'mmol/L';
  reminderTime?: string; // "20:00"
}

export interface ExtractionResult {
  type: ReadingType | 'unknown';
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  glucose: number | null;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0 - 100
  rawText: string;
}

export interface AiInsight {
  id: string;
  text: string;
  direction: 'rising' | 'falling' | 'stable' | 'fluctuating';
  generatedAt: string;
  disclaimer: string;
}

export type ActiveTab = 'dashboard' | 'timeline' | 'add' | 'share' | 'settings';
