import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRj72qsWJ0eQucoSumOozdRxUktHiccUw",
  authDomain: "biljart-club-manager.firebaseapp.com",
  projectId: "biljart-club-manager",
  storageBucket: "biljart-club-manager.firebasestorage.app",
  messagingSenderId: "744239322101",
  appId: "1:744239322101:web:6ac63c76581cebb03486bc"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
