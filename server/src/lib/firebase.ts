import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { Reading } from './types.js';

function buildFirestore(): Firestore | null {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) return null;

  try {
    const serviceAccount = JSON.parse(rawKey);
    const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
    return getFirestore(app);
  } catch (err) {
    console.error('[firebase] failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err);
    return null;
  }
}

const db = buildFirestore();

export const isFirebaseConfigured = () => db !== null;

// In-memory fallback so the API works with zero cloud setup during a demo.
const memoryStore: Reading[] = [];

// users/{userId}/readings/{readingId} — keeps each user's data in its own
// subcollection so per-user access (see firestore.rules) is structural, not a query filter.
function readingsCollection(userId: string) {
  return db!.collection('users').doc(userId).collection('readings');
}

export async function listReadings(userId: string): Promise<Reading[]> {
  if (!db) {
    return memoryStore.filter((r) => r.userId === userId);
  }
  const snapshot = await readingsCollection(userId).orderBy('takenAt', 'desc').get();
  return snapshot.docs.map((doc) => doc.data() as Reading);
}

export async function addReading(reading: Reading): Promise<Reading> {
  if (!db) {
    memoryStore.unshift(reading);
    return reading;
  }
  await readingsCollection(reading.userId).doc(reading.id).set(reading);
  return reading;
}

export async function deleteReading(userId: string, id: string): Promise<void> {
  if (!db) {
    const idx = memoryStore.findIndex((r) => r.id === id && r.userId === userId);
    if (idx >= 0) memoryStore.splice(idx, 1);
    return;
  }
  await readingsCollection(userId).doc(id).delete();
}
