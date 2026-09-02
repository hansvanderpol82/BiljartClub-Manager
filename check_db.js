import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = { projectId: "biljart-club-manager", appId: "1:744239322101:web:6ac63c76581cebb03486bc", apiKey: "AIzaSyDWYSm57M3L7S5FbGzanOxkil8o75K4EeQ" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDoc(doc(db, "appData", "main"));
    if (snap.exists()) {
        const data = JSON.parse(snap.data().data);
        console.log("Seasons:", data.seasons?.length || 0);
        if (data.seasons?.length) {
            console.log(data.seasons.map(s => s.name).join(", "));
        }
        console.log("External Matches:", data.externalMatches?.length || 0);
        if (data.externalMatches?.length) {
            console.log(data.externalMatches.map(e => e.name).join(", "));
        }
    }
    process.exit(0);
}
run();
