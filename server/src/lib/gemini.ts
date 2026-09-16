import { GoogleGenAI, Type } from '@google/genai';
import { ExtractionResult } from './types.js';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const readingSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['bp', 'glucose', 'unknown'] },
    systolic: { type: Type.NUMBER, nullable: true },
    diastolic: { type: Type.NUMBER, nullable: true },
    pulse: { type: Type.NUMBER, nullable: true },
    glucose: { type: Type.NUMBER, nullable: true },
    confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
    rawText: { type: Type.STRING },
  },
  required: ['type', 'confidence', 'rawText'],
};

const EXTRACT_PROMPT = `You read numbers off home medical monitors.
Identify whether the input shows a blood pressure monitor (systolic/diastolic mmHg, optional pulse) or a glucose meter (mg/dL).
Extract only the numbers actually shown or spoken. If unclear, set type to "unknown" and confidence to "low".
Never guess values that are not visible/spoken. Respond with JSON matching the schema only.`;

const UNKNOWN_RESULT: ExtractionResult = {
  type: 'unknown',
  systolic: null,
  diastolic: null,
  pulse: null,
  glucose: null,
  confidence: 'low',
  rawText: '',
};

export const isGeminiConfigured = () => ai !== null;

type ExtractInput =
  | { mode: 'image'; imageBase64: string; mimeType: string }
  | { mode: 'text'; transcript: string }
  | { mode: 'audio'; audioBase64: string; mimeType: string };

export async function extractReading(input: ExtractInput): Promise<ExtractionResult> {
  if (!ai) {
    return { ...UNKNOWN_RESULT, rawText: 'GEMINI_API_KEY not configured on server' };
  }

  try {
    const contents =
      input.mode === 'image'
        ? [{ inlineData: { data: input.imageBase64, mimeType: input.mimeType } }, EXTRACT_PROMPT]
        : input.mode === 'audio'
          ? [{ inlineData: { data: input.audioBase64, mimeType: input.mimeType } }, EXTRACT_PROMPT]
          : [EXTRACT_PROMPT, input.transcript];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: { responseMimeType: 'application/json', responseSchema: readingSchema },
    });

    const text = response.text;
    if (!text) return UNKNOWN_RESULT;

    const parsed = JSON.parse(text);
    return {
      type: parsed.type ?? 'unknown',
      systolic: parsed.systolic ?? null,
      diastolic: parsed.diastolic ?? null,
      pulse: parsed.pulse ?? null,
      glucose: parsed.glucose ?? null,
      confidence: parsed.confidence ?? 'low',
      rawText: parsed.rawText ?? '',
    };
  } catch (err) {
    console.error('[gemini] extraction failed:', err);
    return { ...UNKNOWN_RESULT, rawText: 'Extraction failed — try again' };
  }
}

const INSIGHT_PROMPT = `You are a cautious health-trend summarizer, NOT a diagnostic tool.
Given these home readings (oldest to newest), write 2-3 plain-language sentences about the trend.
Mention direction (rising/falling/stable) and rough magnitude. Do not diagnose or name conditions.
End with one gentle, practical suggestion. Max 60 words.`;

export async function generateInsight(readingsSummary: string): Promise<string> {
  if (!ai) {
    return 'AI insights are unavailable right now (server has no Gemini API key configured). Your data is still being tracked normally.';
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [INSIGHT_PROMPT, readingsSummary],
    });
    return response.text?.trim() || 'No insight could be generated from the current readings.';
  } catch (err) {
    console.error('[gemini] insight failed:', err);
    return 'Could not generate an insight right now — please try again in a moment.';
  }
}

export interface HealthAnalysis {
  overallSummary: string;
  patterns: string[];
  suggestions: string[];
  urgency: 'routine' | 'monitor_closely' | 'discuss_with_doctor_soon';
  disclaimer: string;
}

const FALLBACK_DISCLAIMER =
  'This is an automated pattern summary, not a diagnosis. Always discuss changes in your readings or symptoms with a qualified healthcare provider.';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallSummary: { type: Type.STRING },
    patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    urgency: { type: Type.STRING, enum: ['routine', 'monitor_closely', 'discuss_with_doctor_soon'] },
  },
  required: ['overallSummary', 'patterns', 'suggestions', 'urgency'],
};

const ANALYSIS_PROMPT = `You are a cautious health-record analyst helping a patient understand their own home
blood-pressure and blood-glucose history. You are NOT a doctor and must never diagnose a condition,
name a disease, or prescribe a treatment or medication change.

You will receive the patient's full reading history (oldest to newest, with source and any notes) and
basic profile context (age, gender). Analyze it and respond with JSON matching the schema:

- overallSummary: 2-4 plain-language sentences describing the overall trend across the FULL history
  (not just recent readings) — direction, stability, and rough magnitude.
- patterns: 2-4 short, specific observations about patterns or correlations you notice — e.g. time-of-day
  effects, differences between reading sources, clusters of anomalies, anything a doctor would find useful
  to know. Only state patterns actually supported by the data; if there isn't enough data for a pattern,
  say so as one of the items instead of inventing one.
- suggestions: 2-4 short, practical, non-diagnostic lifestyle or monitoring suggestions (e.g. "measure BP
  at the same time each morning for more comparable trends", "consider noting meals before glucose checks").
  Never suggest starting, stopping, or changing medication or dosage.
- urgency: one of "routine" (values are mostly in normal range), "monitor_closely" (trend is drifting
  toward concerning territory, or there is real variability worth watching), or
  "discuss_with_doctor_soon" (frequent or worsening out-of-range readings across the history).
  This is about longer-term pattern review, not acute emergencies.`;

export async function analyzeHealthRecords(
  readingsSummary: string,
  profileSummary: string
): Promise<HealthAnalysis> {
  const fallback: HealthAnalysis = {
    overallSummary: readingsSummary.trim()
      ? 'AI analysis is unavailable right now (server has no Gemini API key configured). Your readings are still being tracked normally, and you can review the raw trend charts and timeline in the meantime.'
      : 'Add a few readings to unlock a full AI analysis of your health record.',
    patterns: [],
    suggestions: [],
    urgency: 'routine',
    disclaimer: FALLBACK_DISCLAIMER,
  };

  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [ANALYSIS_PROMPT, `Profile: ${profileSummary}`, `Readings:\n${readingsSummary}`],
      config: { responseMimeType: 'application/json', responseSchema: analysisSchema },
    });

    const text = response.text;
    if (!text) return fallback;

    const parsed = JSON.parse(text);
    return {
      overallSummary: parsed.overallSummary ?? fallback.overallSummary,
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      urgency: parsed.urgency ?? 'routine',
      disclaimer: FALLBACK_DISCLAIMER,
    };
  } catch (err) {
    console.error('[gemini] health analysis failed:', err);
    return {
      ...fallback,
      overallSummary: 'Could not generate a full analysis right now — please try again in a moment.',
    };
  }
}
