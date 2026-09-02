import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    const data = JSON.parse(snap.data().data);
    
    console.log("Seasons in DB:");
    data.seasons.forEach(s => console.log(s.name, "members array:", Array.isArray(s.members), "speeldagen array:", Array.isArray(s.speeldagen)));
    
    console.log("\nExternal matches:");
    if (data.externalMatches) {
        data.externalMatches.forEach(m => console.log(m.name, "games array:", Array.isArray(m.games)));
    }
    process.exit(0);
}
run();
