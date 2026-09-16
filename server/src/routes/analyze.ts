import { Router } from 'express';
import { z } from 'zod';
import { analyzeHealthRecords } from '../lib/gemini.js';

const readingSchema = z.object({
  type: z.enum(['bp', 'glucose']),
  systolic: z.number().nullable().optional(),
  diastolic: z.number().nullable().optional(),
  pulse: z.number().nullable().optional(),
  glucose: z.number().nullable().optional(),
  source: z.enum(['camera', 'voice', 'manual']).optional(),
  takenAt: z.string(),
  notes: z.string().nullable().optional(),
});

const bodySchema = z.object({
  readings: z.array(readingSchema).max(500),
  profile: z
    .object({
      age: z.number().nullable().optional(),
      gender: z.string().nullable().optional(),
    })
    .optional(),
});

export const analyzeRouter = Router();

analyzeRouter.post('/', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid analysis payload', details: parsed.error.flatten() });
  }

  const { readings, profile } = parsed.data;

  const summary = readings
    .map((r) => {
      const value =
        r.type === 'bp'
          ? `BP ${r.systolic ?? '?'}/${r.diastolic ?? '?'} mmHg${r.pulse ? `, pulse ${r.pulse}` : ''}`
          : `Glucose ${r.glucose ?? '?'} mg/dL`;
      const note = r.notes ? ` (note: ${r.notes})` : '';
      return `${r.takenAt}: ${value} [source: ${r.source ?? 'unknown'}]${note}`;
    })
    .join('\n');

  const profileSummary = profile
    ? `age: ${profile.age ?? 'unknown'}, gender: ${profile.gender ?? 'unknown'}`
    : 'not provided';

  try {
    const analysis = await analyzeHealthRecords(summary, profileSummary);
    res.json({ analysis });
  } catch (err) {
    console.error('[analyze] unexpected error:', err);
    res.status(200).json({
      analysis: {
        overallSummary: 'Could not generate a full analysis right now — please try again.',
        patterns: [],
        suggestions: [],
        urgency: 'routine',
        disclaimer:
          'This is an automated pattern summary, not a diagnosis. Always discuss changes in your readings or symptoms with a qualified healthcare provider.',
      },
    });
  }
});
