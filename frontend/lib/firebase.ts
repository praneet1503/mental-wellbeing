import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Prevent multiple Firebase initializations (SSR-safe)
let app: FirebaseApp;
if (typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
} else {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: Prompt user to select account every time
googleProvider.setCustomParameters({
  prompt: "select_account",
});
