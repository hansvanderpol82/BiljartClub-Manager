import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "biljart-club-manager",
  appId: "1:744239322101:web:6ac63c76581cebb03486bc",
  apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ",
  authDomain: "biljart-club-manager.firebaseapp.com",
  storageBucket: "biljart-club-manager.firebasestorage.app",
  messagingSenderId: "744239322101",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const seasonsSnap = await getDocs(collection(db, "seasons"));
    let count = 0;
    for (const d of seasonsSnap.docs) {
        const data = d.data();
        if (!data.aanvangstijd) {
            await updateDoc(doc(db, "seasons", d.id), { aanvangstijd: "19:00" });
            count++;
        }
    }
    console.log("Updated", count, "seasons");
    process.exit(0);
}
run();
