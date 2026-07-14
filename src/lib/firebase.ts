import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "quiet-mapper-x8gvj",
  appId: "1:239989934146:web:6f8025516b519f676485db",
  apiKey: "AIzaSyApBf4HzDTKMJKw2sK1w_ttp0gaPS-vrfs",
  authDomain: "quiet-mapper-x8gvj.firebaseapp.com",
  storageBucket: "quiet-mapper-x8gvj.firebasestorage.app",
  messagingSenderId: "239989934146",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-biljartclubmanag-af61e8bf-c90d-4a89-bba5-f74703a70cb1");
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
