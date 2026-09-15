export type ReadingType = 'bp' | 'glucose';
export type ReadingSource = 'camera' | 'voice' | 'manual';
export type Flag = 'high' | 'low' | null;

export interface Reading {
  id: string;
  userId: string;
  type: ReadingType;
  systolic?: number | null;
  diastolic?: number | null;
  pulse?: number | null;
  glucose?: number | null;
  source: ReadingSource;
  flag: Flag;
  takenAt: string;
  createdAt: string;
  notes?: string | null;
}

export interface ExtractionResult {
  type: ReadingType | 'unknown';
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  glucose: number | null;
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
}
