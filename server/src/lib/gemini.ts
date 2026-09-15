import { GoogleGenAI, Type } from '@google/genai';
import { ExtractionResult } from './types.js';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite';

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
