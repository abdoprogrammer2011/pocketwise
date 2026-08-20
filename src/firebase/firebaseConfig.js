// -----------------------------------------------------------------------------
// Firebase setup for PocketWise.
//
// 1. Create a project at https://console.firebase.google.com
// 2. Enable Authentication -> Sign-in method -> Email/Password
// 3. Create a Firestore database (production mode) and deploy firestore.rules
//    from the project root: `firebase deploy --only firestore:rules`
// 4. Copy .env.example to .env and fill in the values from
//    Project Settings -> General -> Your apps -> SDK setup and configuration
// -----------------------------------------------------------------------------
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

// `auth` and `db` are imported directly by every service function in src/services/,
// so this is the single place the rest of the app talks to Firebase through.
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
