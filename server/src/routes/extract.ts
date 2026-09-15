import { Router } from 'express';
import { z } from 'zod';
import { extractReading } from '../lib/gemini.js';

const bodySchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('image'), imageBase64: z.string().min(1), mimeType: z.enum(['image/jpeg', 'image/png']) }),
  z.object({ mode: z.literal('text'), transcript: z.string().min(1).max(2000) }),
  z.object({ mode: z.literal('audio'), audioBase64: z.string().min(1), mimeType: z.enum(['audio/webm', 'audio/mp4']) }),
]);

// Simple per-IP debounce so a double-tap doesn't fire two Gemini calls at once.
const inFlight = new Set<string>();

export const extractRouter = Router();

extractRouter.post('/', async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      type: 'unknown',
      systolic: null,
      diastolic: null,
      pulse: null,
      glucose: null,
      confidence: 'low',
      rawText: 'Invalid request',
    });
  }

  const key = req.ip ?? 'unknown';
  if (inFlight.has(key)) {
    return res.status(429).json({
      type: 'unknown',
      systolic: null,
      diastolic: null,
      pulse: null,
      glucose: null,
      confidence: 'low',
      rawText: 'Already processing a request — please wait',
    });
  }

  inFlight.add(key);
  try {
    const result = await extractReading(parsed.data);
    res.json(result);
  } catch (err) {
    console.error('[extract] unexpected error:', err);
    res.status(200).json({
      type: 'unknown',
      systolic: null,
      diastolic: null,
      pulse: null,
      glucose: null,
      confidence: 'low',
      rawText: "Couldn't read this — try again or use voice/manual",
    });
  } finally {
    inFlight.delete(key);
  }
});
