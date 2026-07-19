/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "biljart-club-manager",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:744239322101:web:6ac63c76581cebb03486bc",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "biljart-club-manager.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "biljart-club-manager.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "744239322101",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

