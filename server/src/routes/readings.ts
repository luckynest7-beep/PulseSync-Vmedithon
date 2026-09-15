import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { addReading, deleteReading, isFirebaseConfigured, listReadings, verifyIdToken } from '../lib/firebase.js';
import { computeFlag } from '../lib/thresholds.js';
import { Reading } from '../lib/types.js';

// Generous but real bounds — wide enough to never reject a genuine device
// reading, tight enough to reject garbage/out-of-range input (e.g. a stray
// negative number or a typo'd extra digit).
const createSchema = z.object({
  type: z.enum(['bp', 'glucose']),
  systolic: z.number().min(40).max(300).nullable().optional(),
  diastolic: z.number().min(20).max(200).nullable().optional(),
  pulse: z.number().min(20).max(250).nullable().optional(),
  glucose: z.number().min(10).max(1000).nullable().optional(),
  source: z.enum(['camera', 'voice', 'manual']),
  takenAt: z.string(),
  notes: z.string().max(500).nullable().optional(),
});

/**
 * When Firebase Admin is configured, every request must carry a valid
 * Firebase ID token — userId is derived from it server-side, never trusted
 * from the client, so one user can't read/write another's data by guessing
 * a userId. When Firebase isn't configured at all, falls back to trusting
 * the client-supplied userId (original zero-setup hackathon-demo behavior).
 */
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isFirebaseConfigured()) {
    res.locals.userId = typeof req.query.userId === 'string' ? req.query.userId : req.body?.userId;
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token' });

  const uid = await verifyIdToken(token);
  if (!uid) return res.status(401).json({ error: 'Invalid or expired token' });

  res.locals.userId = uid;
  next();
}

export const readingsRouter = Router();
readingsRouter.use(requireAuth);

readingsRouter.get('/', async (_req, res) => {
  const userId = res.locals.userId as string | undefined;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const readings = await listReadings(userId);
    res.json({ readings });
  } catch (err) {
    console.error('[readings] list failed:', err);
    res.status(500).json({ error: 'Failed to load readings' });
  }
});

readingsRouter.post('/', async (req, res) => {
  const userId = res.locals.userId as string | undefined;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid reading payload', details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const flag = computeFlag(data.type, { systolic: data.systolic, diastolic: data.diastolic, glucose: data.glucose });

  const reading: Reading = {
    id: randomUUID(),
    userId,
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
  const userId = res.locals.userId as string | undefined;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    await deleteReading(userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('[readings] delete failed:', err);
    res.status(500).json({ error: 'Failed to delete reading' });
  }
});
