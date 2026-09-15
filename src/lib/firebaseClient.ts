import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Public client config from Firebase Console > Project Settings > General >
// "Your apps" (Web app). Safe to expose in the browser bundle — security is
// enforced by Firebase Auth + Firestore rules, not by hiding this config.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseAuthConfigured = Boolean(firebaseConfig.apiKey);

const app = isFirebaseAuthConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
