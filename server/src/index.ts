import { app } from './app.js';
import { isGeminiConfigured } from './lib/gemini.js';
import { isFirebaseConfigured } from './lib/firebase.js';

const port = Number(process.env.PORT) || 8000;

app.listen(port, () => {
  console.log(`PulseSync API listening on http://localhost:${port}`);
  console.log(`  Gemini configured:   ${isGeminiConfigured()}`);
  console.log(`  Firebase configured: ${isFirebaseConfigured()}`);
});
