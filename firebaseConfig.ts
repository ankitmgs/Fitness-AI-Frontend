// ----------------------------------------------------------------
// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
// ----------------------------------------------------------------
// You can get this from your Firebase project console.
// 1. Go to your project settings (gear icon).
// 2. In the "General" tab, scroll down to "Your apps".
// 3. Select your web app.
// 4. Under "Firebase SDK snippet", choose "Config" and copy the object.
// ----------------------------------------------------------------

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGEING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};