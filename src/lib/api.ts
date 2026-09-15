import { ExtractionResult, Reading } from './types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const REQUEST_TIMEOUT_MS = 8000;

function confidenceToScore(confidence: 'high' | 'medium' | 'low'): number {
  return confidence === 'high' ? 96 : confidence === 'medium' ? 72 : 38;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Request to ${path} failed with ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

interface BackendExtraction {
  type: 'bp' | 'glucose' | 'unknown';
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  glucose: number | null;
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
}

function toExtractionResult(res: BackendExtraction): ExtractionResult {
  return { ...res, confidenceScore: confidenceToScore(res.confidence) };
}

/** Calls the live Gemini-backed extraction endpoint. Throws on any failure so callers can fall back to the offline stub. */
export async function extractImageViaApi(imageBase64Data: string, mimeType: string): Promise<ExtractionResult> {
  const result = await postJson<BackendExtraction>('/api/extract', { mode: 'image', imageBase64: imageBase64Data, mimeType });
  return toExtractionResult(result);
}

export async function extractTextViaApi(transcript: string): Promise<ExtractionResult> {
  const result = await postJson<BackendExtraction>('/api/extract', { mode: 'text', transcript });
  return toExtractionResult(result);
}

export async function fetchInsightViaApi(readings: Reading[]): Promise<string> {
  const payload = readings.slice(0, 10).map((r) => ({
    type: r.type,
    systolic: r.systolic ?? null,
    diastolic: r.diastolic ?? null,
    pulse: r.pulse ?? null,
    glucose: r.glucose ?? null,
    takenAt: r.takenAt,
  }));
  const result = await postJson<{ insight: string }>('/api/insight', { readings: payload });
  return result.insight;
}

/** Real, per-user persistence backed by Firestore (server/src/routes/readings.ts). */

export async function fetchReadingsViaApi(userId: string, idToken: string): Promise<Reading[]> {
  const res = await fetch(`${API_BASE}/api/readings?userId=${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch readings (${res.status})`);
  const data = await res.json();
  return data.readings as Reading[];
}

export async function createReadingViaApi(reading: Reading, idToken: string): Promise<Reading> {
  const res = await fetch(`${API_BASE}/api/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(reading),
  });
  if (!res.ok) throw new Error(`Failed to save reading (${res.status})`);
  const data = await res.json();
  return data.reading as Reading;
}

export async function deleteReadingViaApi(id: string, userId: string, idToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/readings/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete reading (${res.status})`);
}
