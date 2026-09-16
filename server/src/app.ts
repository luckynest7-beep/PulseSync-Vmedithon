import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { extractRouter } from './routes/extract.js';
import { insightRouter } from './routes/insight.js';
import { readingsRouter } from './routes/readings.js';
import { analyzeRouter } from './routes/analyze.js';
import { isGeminiConfigured } from './lib/gemini.js';
import { isFirebaseConfigured } from './lib/firebase.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // base64 images/audio need headroom

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    gemini: isGeminiConfigured(),
    firebase: isFirebaseConfigured(),
  });
});

app.use('/api/extract', extractRouter);
app.use('/api/insight', insightRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/analyze', analyzeRouter);
