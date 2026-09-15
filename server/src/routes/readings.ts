import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { addReading, deleteReading, listReadings } from '../lib/supabase.js';
import { computeFlag } from '../lib/thresholds.js';
import { Reading } from '../lib/types.js';

const createSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['bp', 'glucose']),
  systolic: z.number().nullable().optional(),
  diastolic: z.number().nullable().optional(),
  pulse: z.number().nullable().optional(),
  glucose: z.number().nullable().optional(),
  source: z.enum(['camera', 'voice', 'manual']),
  takenAt: z.string(),
  notes: z.string().max(500).nullable().optional(),
});

// ponytail: userId is trusted from the request body/query with no session check —
// fine for a single-demo-user hackathon build (matches plan-ps4.md Phase 3 scope:
// "magic link or anonymous, keep it simple"). Before real multi-user use, verify a
// Supabase JWT (supabase.auth.getUser(token)) and derive userId from it server-side.
export const readingsRouter = Router();

readingsRouter.get('/', async (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : '';
  if (!userId) return res.status(400).json({ error: 'userId query param is required' });

  try {
    const readings = await listReadings(userId);
    res.json({ readings });
  } catch (err) {
    console.error('[readings] list failed:', err);
    res.status(500).json({ error: 'Failed to load readings' });
  }
});

readingsRouter.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid reading payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const flag = computeFlag(data.type, { systolic: data.systolic, diastolic: data.diastolic, glucose: data.glucose });

  const reading: Reading = {
    id: randomUUID(),
    userId: data.userId,
    type: data.type,
    systolic: data.systolic ?? null,
    diastolic: data.diastolic ?? null,
    pulse: data.pulse ?? null,
    glucose: data.glucose ?? null,
    source: data.source,
    flag,
    takenAt: data.takenAt,
    createdAt: new Date().toISOString(),
    notes: data.notes ?? null,
  };

  try {
    const saved = await addReading(reading);
    res.status(201).json({ reading: saved });
  } catch (err) {
    console.error('[readings] create failed:', err);
    res.status(500).json({ error: 'Failed to save reading' });
  }
});

readingsRouter.delete('/:id', async (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : '';
  if (!userId) return res.status(400).json({ error: 'userId query param is required' });

  try {
    await deleteReading(userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('[readings] delete failed:', err);
    res.status(500).json({ error: 'Failed to delete reading' });
  }
});
