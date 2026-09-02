import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const docRef = doc(db, "appData", "main");
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        console.log("No data found.");
        process.exit(0);
    }
    const data = JSON.parse(snap.data().data);
    
    const clubToRemove = data.clubs.find(c => c.name.toLowerCase().includes("kromme keu"));
    if (clubToRemove) {
        data.clubs = data.clubs.filter(c => c.id !== clubToRemove.id);
        await updateDoc(docRef, { data: JSON.stringify(data) });
        console.log("Removed club:", clubToRemove.name);
    } else {
        console.log("Club 'Kromme Keu' not found.");
        // Let's print existing clubs just in case
        console.log("Existing clubs:", data.clubs.map(c => c.name).join(", "));
    }
    process.exit(0);
}
run();
