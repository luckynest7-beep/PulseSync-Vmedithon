import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { extractRouter } from './routes/extract.js';
import { insightRouter } from './routes/insight.js';
import { readingsRouter } from './routes/readings.js';
import { isGeminiConfigured } from './lib/gemini.js';
import { isSupabaseConfigured } from './lib/supabase.js';

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // base64 images/audio need headroom

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    gemini: isGeminiConfigured(),
    supabase: isSupabaseConfigured(),
  });
});

app.use('/api/extract', extractRouter);
app.use('/api/insight', insightRouter);
app.use('/api/readings', readingsRouter);

app.listen(port, () => {
  console.log(`PulseSync API listening on http://localhost:${port}`);
  console.log(`  Gemini configured:   ${isGeminiConfigured()}`);
  console.log(`  Supabase configured: ${isSupabaseConfigured()}`);
});
