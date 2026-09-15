import { Router } from 'express';
import { z } from 'zod';
import { generateInsight } from '../lib/gemini.js';

const readingSchema = z.object({
  type: z.enum(['bp', 'glucose']),
  systolic: z.number().nullable().optional(),
  diastolic: z.number().nullable().optional(),
  pulse: z.number().nullable().optional(),
  glucose: z.number().nullable().optional(),
  takenAt: z.string(),
});

const bodySchema = z.object({
  readings: z.array(readingSchema).max(10),
});

export const insightRouter = Router();

insightRouter.post('/', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ insight: 'Not enough data to generate an insight yet.' });
  }

  if (parsed.data.readings.length === 0) {
    return res.json({ insight: 'Add a few readings to unlock AI-driven trend insights.' });
  }

  const summary = parsed.data.readings
    .map((r) =>
      r.type === 'bp'
        ? `${r.takenAt}: BP ${r.systolic ?? '?'}/${r.diastolic ?? '?'} mmHg`
        : `${r.takenAt}: Glucose ${r.glucose ?? '?'} mg/dL`
    )
    .join('\n');

  try {
    const insight = await generateInsight(summary);
    res.json({ insight });
  } catch (err) {
    console.error('[insight] unexpected error:', err);
    res.status(200).json({ insight: 'Could not generate an insight right now — please try again.' });
  }
});
